from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.http import HttpResponse
from django.utils import timezone
from datetime import date
from decimal import Decimal
import random
import uuid
from .models import (
    PaymentMethod, PaymentTransaction, DepositHold, 
    BillingInvoice, PaymentReceipt, RefundRequest, PromoCode
)
from .serializers import (
    PaymentMethodSerializer, PaymentTransactionSerializer, DepositHoldSerializer,
    BillingInvoiceSerializer, PaymentReceiptSerializer, RefundRequestSerializer
)
from apps.bookings.models import Booking
from services.payment_service import create_invoice_and_receipt

class PaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def send_otp(self, request, pk=None):
        card = self.get_object()
        # Mock SMS sending
        return Response({"message": "OTP sent successfully."})

    @action(detail=True, methods=['post'])
    def verify_otp(self, request, pk=None):
        card = self.get_object()
        otp = request.data.get('otp')
        if otp:
            if PaymentMethod.objects.filter(user=self.request.user, is_default=True).count() == 0:
                card.is_default = True
            card.is_verified = True
            card.save()
            return Response({"message": "Card verified successfully."})
        return Response({"error": "OTP is required"}, status=status.HTTP_400_BAD_REQUEST)


class PaymentTransactionViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PaymentTransaction.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='pending')

    @action(detail=True, methods=['post'])
    def pay_with_card(self, request, pk=None):
        transaction = self.get_object()
        transaction.status = 'paid'
        transaction.save()
        
        if transaction.payment_type == 'deposit' and transaction.booking:
            DepositHold.objects.create(
                user=self.request.user,
                booking=transaction.booking,
                amount=transaction.amount,
                status='held',
                transaction=transaction
            )
            
        return Response({"message": "Payment successful", "status": "paid"})


class BillingInvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BillingInvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BillingInvoice.objects.filter(user=self.request.user).order_by('-created_at')


class PaymentReceiptViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentReceiptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PaymentReceipt.objects.filter(invoice__user=self.request.user).order_by('-paid_at')

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        receipt = self.get_object()
        pdf_bytes = _build_receipt_pdf(receipt, request.user)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{receipt.receipt_number}.pdf"'
        return response


class RefundRequestViewSet(viewsets.ModelViewSet):
    serializer_class = RefundRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RefundRequest.objects.filter(transaction__user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save()


class DepositHoldViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DepositHoldSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DepositHold.objects.filter(user=self.request.user).order_by('-created_at')


class PromoCodeViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='validate')
    def validate(self, request):
        code_str = request.data.get('code')
        if not code_str:
            return Response({"error": "Promo kod kiritilmagan"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            promo = PromoCode.objects.get(code__iexact=code_str, is_active=True, valid_until__gte=timezone.now())
            return Response({
                "valid": True,
                "code": promo.code,
                "discount_type": promo.discount_type,
                "discount_value": promo.discount_value
            })
        except PromoCode.DoesNotExist:
            return Response({"valid": False, "error": "Noto'g'ri yoki muddati o'tgan promo kod"}, status=status.HTTP_404_NOT_FOUND)


class InitiatePaymentView(APIView):
    """
    POST /api/payments/initiate/
    Body: { booking_id, card_number?, payment_method_id?, expiry?, cvv?, holder?, insurance_plan_id? }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        payment_type = (request.data.get('payment_type') or 'card').lower()
        payment_method_id = request.data.get('payment_method_id')
        card_number = (request.data.get('card_number') or '').replace(' ', '')
        payment_method = None
        qr_methods = {'payme', 'click', 'uzum'}

        if payment_type not in {'card', 'payme', 'click', 'uzum'}:
            return Response({'error': 'payment_type noto\'g\'ri'}, status=status.HTTP_400_BAD_REQUEST)

        if not booking_id:
            return Response({'error': 'booking_id talab qilinadi'}, status=status.HTTP_400_BAD_REQUEST)

        if payment_method_id:
            try:
                payment_method = PaymentMethod.objects.get(id=payment_method_id, user=request.user)
            except PaymentMethod.DoesNotExist:
                return Response({'error': 'To\'lov kartasi topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        if payment_type == 'card' and not payment_method and len(card_number) < 12:
            return Response({'error': 'Karta raqami noto\'g\'ri'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Bron topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        if payment_type == 'card' and payment_method and payment_method.masked_pan.startswith('0000'):
            return Response(
                {
                    'error': 'Kartada mablag\' yetarli emas',
                    'code': 'INSUFFICIENT_FUNDS',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if payment_type == 'card' and not payment_method and card_number.startswith('0000'):
            return Response(
                {
                    'error': 'Kartada mablag\' yetarli emas',
                    'code': 'INSUFFICIENT_FUNDS',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_qr_payment = payment_type in qr_methods
        otp_code = str(random.randint(100000, 999999)) if not is_qr_payment else None
        payment_ref = f"RL-{date.today().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        transaction = PaymentTransaction.objects.create(
            user=request.user,
            booking=booking,
            amount=booking.total_price,
            payment_type='qr' if is_qr_payment else ('card' if payment_method else 'new_card'),
            payment_method=payment_method,
            status='pending' if is_qr_payment else 'otp_sent',
            otp_code=otp_code,
        )

        response_data = {
            'transaction_id': transaction.id,
            'payment_ref': payment_ref,
            'amount': str(transaction.amount),
        }

        if is_qr_payment:
            response_data.update(
                {
                    'message': 'QR to\'lov yaratildi',
                    'payment_type': payment_type,
                    'qr_data': f'https://fake-payment.ridelux.uz/pay/{payment_ref}',
                    'expires_in': 900,
                }
            )
        else:
            response_data.update(
                {
                    'message': 'OTP yuborildi',
                    '_dev_otp': otp_code if request.user.is_staff else None,
                }
            )

        return Response(response_data, status=status.HTTP_200_OK)


def _finalize_successful_payment(txn, user):
    txn.status = 'paid'
    txn.save(update_fields=['status', 'updated_at'])

    booking = txn.booking
    if booking:
        booking.status = 'approved'
        booking.save(update_fields=['status'])

    invoice, receipt = create_invoice_and_receipt(user, booking, txn)
    loyalty_points = max(1, int(txn.amount / 100000) * 10)

    try:
        from apps.loyalty.models import LoyaltyAccount

        account, _ = LoyaltyAccount.objects.get_or_create(user=user)
        account.add_points(loyalty_points, f"Booking #{booking.id} payment", booking=booking)
    except Exception:
        # Loyalty module is optional for payment success.
        pass

    return invoice, receipt, booking, loyalty_points


class VerifyPaymentView(APIView):
    """
    POST /api/payments/verify/
    Body: { transaction_id, otp_code? }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        transaction_id = request.data.get('transaction_id')
        otp_code = request.data.get('otp_code')

        if not transaction_id:
            return Response({'error': 'transaction_id talab qilinadi'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            txn = PaymentTransaction.objects.get(
                id=transaction_id,
                user=request.user,
                status__in=['otp_sent', 'pending'],
            )
        except PaymentTransaction.DoesNotExist:
            return Response({'error': 'Tranzaksiya topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        if txn.payment_type in ['card', 'new_card']:
            if not otp_code:
                return Response({'error': 'otp_code talab qilinadi'}, status=status.HTTP_400_BAD_REQUEST)
            if txn.otp_code != otp_code:
                return Response(
                    {
                        'error': 'Noto\'g\'ri kod. Qayta urinib ko\'ring.',
                        'code': 'INVALID_OTP',
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        invoice, receipt, booking, loyalty_points = _finalize_successful_payment(txn, request.user)

        return Response(
            {
                'status': 'success',
                'receipt_id': receipt.id,
                'receipt_number': receipt.receipt_number,
                'invoice_id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'amount_paid': str(txn.amount),
                'booking_status': booking.status if booking else None,
                'loyalty_points_earned': loyalty_points,
            },
            status=status.HTTP_200_OK,
        )


class VerifyOTPView(APIView):
    """
    POST /api/payments/verify-otp/
    Body: { transaction_id, otp_code }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        transaction_id = request.data.get('transaction_id')
        otp_code = request.data.get('otp_code')

        if not transaction_id or not otp_code:
            return Response(
                {'error': 'transaction_id va otp_code talab qilinadi'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            txn = PaymentTransaction.objects.get(
                id=transaction_id,
                user=request.user,
                status='otp_sent',
            )
        except PaymentTransaction.DoesNotExist:
            return Response({'error': 'Tranzaksiya topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        if txn.otp_code != otp_code:
            return Response(
                {
                    'error': 'Noto\'g\'ri kod. Qayta urinib ko\'ring.',
                    'code': 'INVALID_OTP',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        invoice, receipt, booking, loyalty_points = _finalize_successful_payment(txn, request.user)

        return Response(
            {
                'status': 'success',
                'receipt_id': receipt.id,
                'receipt_number': receipt.receipt_number,
                'invoice_id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'amount_paid': str(txn.amount),
                'booking_status': booking.status if booking else None,
                'loyalty_points_earned': loyalty_points,
            },
            status=status.HTTP_200_OK,
        )


class ResendOTPView(APIView):
    """
    POST /api/payments/resend-otp/
    Body: { transaction_id }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        transaction_id = request.data.get('transaction_id')
        if not transaction_id:
            return Response({'error': 'transaction_id talab qilinadi'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            txn = PaymentTransaction.objects.get(
                id=transaction_id,
                user=request.user,
                status='otp_sent',
            )
        except PaymentTransaction.DoesNotExist:
            return Response({'error': 'Tranzaksiya topilmadi yoki holati yaroqsiz'}, status=status.HTTP_404_NOT_FOUND)

        otp_code = str(random.randint(100000, 999999))
        txn.otp_code = otp_code
        txn.save(update_fields=['otp_code', 'updated_at'])

        return Response(
            {
                'message': 'OTP qayta yuborildi',
                '_dev_otp': otp_code if request.user.is_staff else None,
            },
            status=status.HTTP_200_OK,
        )


def _pdf_escape(value):
    return str(value).replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def _build_receipt_pdf(receipt, user):
    lines = [
        'RIDELUX PAYMENT RECEIPT',
        f'Receipt: {receipt.receipt_number}',
        f'Invoice: {receipt.invoice.invoice_number if receipt.invoice else "-"}',
        f'Amount: {receipt.amount} UZS',
        f'Paid At: {receipt.paid_at.strftime("%Y-%m-%d %H:%M:%S") if receipt.paid_at else "-"}',
        f'User: {user.username}',
    ]

    text_ops = ['BT', '/F1 12 Tf', '50 780 Td']
    for idx, line in enumerate(lines):
        if idx > 0:
            text_ops.append('0 -18 Td')
        text_ops.append(f'({_pdf_escape(line)}) Tj')
    text_ops.append('ET')

    content_stream = ('\n'.join(text_ops)).encode('latin-1', errors='replace')

    objects = [
        b'1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
        b'2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
        b'3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
        b'4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
        f'5 0 obj\n<< /Length {len(content_stream)} >>\nstream\n'.encode('latin-1')
        + content_stream
        + b'\nendstream\nendobj\n',
    ]

    pdf = bytearray(b'%PDF-1.4\n')
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)

    xref_start = len(pdf)
    pdf.extend(f'xref\n0 {len(offsets)}\n'.encode('latin-1'))
    pdf.extend(b'0000000000 65535 f \n')
    for off in offsets[1:]:
        pdf.extend(f'{off:010} 00000 n \n'.encode('latin-1'))

    pdf.extend(
        f'trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n'.encode('latin-1')
    )
    return bytes(pdf)
