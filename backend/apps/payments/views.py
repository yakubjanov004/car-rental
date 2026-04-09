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
from services.payment_service import create_invoice_and_receipt
import logging

logger = logging.getLogger('apps.payments')

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
        return PaymentTransaction.objects.filter(user=self.request.user).select_related('booking', 'user').order_by('-created_at')

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

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        invoice = self.get_object()
        pdf_bytes = _build_invoice_pdf(invoice, request.user)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{invoice.invoice_number}.pdf"'
        return response


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


from .adapters.factory import get_payment_adapter

class InitiatePaymentView(APIView):
    """
    POST /api/payments/initiate/
    Body: { booking_id, provider, method }
    """
    permission_classes = [IsAuthenticated]
    throttle_scope = 'payment_initiate'

    def post(self, request):
        booking_id = request.data.get('booking_id')
        provider_name = request.data.get('provider', 'mock')
        method = request.data.get('method', 'card')

        if not booking_id:
            return Response({'error': 'booking_id talab qilinadi'}, status=status.HTTP_400_BAD_REQUEST)

        from django.apps import apps
        Booking = apps.get_model('bookings', 'Booking')
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Bron topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        # Create Transaction record
        transaction = PaymentTransaction.objects.create(
            user=request.user,
            booking=booking,
            amount=booking.total_price,
            provider=provider_name,
            method=method,
            status='initiated'
        )

        # Use Adapter to trigger provider logic
        adapter = get_payment_adapter(provider_name)
        result = adapter.initiate_payment(transaction)
        logger.info(f"Payment initiated: TXN {transaction.id} for Booking {booking.id} ({transaction.amount} {transaction.currency})")

        response_data = {
            'transaction_id': transaction.id,
            'payment_code': transaction.payment_code,
            'amount': str(transaction.amount),
            'currency': transaction.currency,
            'status': transaction.status,
            'otp_required': result.get('otp_required', False),
            'checkout_url': result.get('checkout_url'),
            'expires_in': result.get('expires_in'),
            'payment_ref': transaction.metadata.get('gateway_ref', ''),
            '_dev_otp': transaction.metadata.get('debug_otp'), # For demo: always send it
        }
        return Response(response_data)

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
            return Response({'error': 'transaction_id va otp_code talab qilinadi'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            txn = PaymentTransaction.objects.get(id=transaction_id, user=request.user)
        except PaymentTransaction.DoesNotExist:
            return Response({'error': 'Tranzaksiya topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        adapter = get_payment_adapter(txn.provider)
        result = adapter.verify_otp(txn, otp_code)

        if result['status'] == 'success':
            # Auto-capture for mock
            capture_result = adapter.capture_payment(txn)
            if capture_result['status'] == 'success':
                _finalize_successful_payment(txn, request.user)
                logger.info(f"Payment successful: TXN {txn.id} verified with OTP")
                return Response({
                    'status': 'success',
                    'payment_status': txn.status,
                    'message': 'To\'lov muvaffaqiyatli amalga oshirildi'
                })
        
        return Response({'error': result.get('message', 'OTP xatosi')}, status=status.HTTP_400_BAD_REQUEST)


class CheckPaymentStatusView(APIView):
    """
    POST /api/payments/verify/
    Body: { transaction_id, payment_type }
    
    Polls the payment provider to check if the QR/redirect payment
    has been completed by the user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        transaction_id = request.data.get('transaction_id')
        if not transaction_id:
            return Response({'error': 'transaction_id talab qilinadi'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            txn = PaymentTransaction.objects.get(id=transaction_id, user=request.user)
        except PaymentTransaction.DoesNotExist:
            return Response({'error': 'Tranzaksiya topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        # If already paid, return success immediately
        if txn.status == 'paid':
            return Response({'status': 'success', 'payment_status': 'paid'})

        adapter = get_payment_adapter(txn.provider)

        # Check if adapter supports status checking
        check_fn = getattr(adapter, 'check_payment_status', None)
        if check_fn:
            result = check_fn(txn)
            if result.get('status') == 'paid':
                _finalize_successful_payment(txn, request.user)
                logger.info(f"Payment confirmed via status check: TXN {txn.id}")
                return Response({'status': 'success', 'payment_status': 'paid'})
            elif result.get('status') == 'cancelled':
                return Response({'status': 'cancelled', 'payment_status': 'cancelled'})
            else:
                return Response({'status': 'pending', 'payment_status': 'pending'})

        # For mock provider: auto-confirm
        if txn.provider == 'mock':
            _finalize_successful_payment(txn, request.user)
            return Response({'status': 'success', 'payment_status': 'paid'})

        return Response({'status': 'pending', 'payment_status': txn.status})


def _finalize_successful_payment(txn, user):
    txn.status = 'paid'
    if not txn.paid_at:
        txn.paid_at = timezone.now()
    txn.save()

    booking = txn.booking
    if booking:
        # Move to payment_pending: user paid, admin needs to give final CONFIRMED status
        booking.status = 'payment_pending'
        booking.save()

    from services.payment_service import create_invoice_and_receipt
    invoice, receipt = create_invoice_and_receipt(user, booking, txn)
    
    # Loyalty logic
    try:
        from django.apps import apps
        LoyaltyAccount = apps.get_model('loyalty', 'LoyaltyAccount')
        loyalty_points = max(1, int(txn.amount / 100000) * 10)
        # Note: we might defer point addition until COMPLETED as per user request
    except Exception:
        pass

    return invoice, receipt, booking

def _pdf_escape(value):
    return str(value).replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')

def _build_invoice_pdf(invoice, user):
    booking = invoice.booking
    car = booking.car
    
    lines = [
        'RIDELUX PREMIUM RENTALS',
        '-----------------------------------',
        f'INVOICE:  {invoice.invoice_number}',
        f'DATE:     {invoice.created_at.strftime("%Y-%m-%d %H:%M")}',
        '',
        'CUSTOMER DETAILS:',
        f'Name:     {user.get_full_name() or user.username}',
        f'Phone:    {user.phone_number or "N/A"}',
        '',
        'BOOKING DETAILS:',
        f'Reference: {booking.booking_code}',
        f'Vehicle:   {car.model_info.brand} {car.model_info.model_name}',
        f'Period:    {booking.start_datetime.strftime("%d.%m %H:%M")} - {booking.end_datetime.strftime("%d.%m %H:%M")}',
        '',
        'PRICE BREAKDOWN:',
        f'Base Price: {invoice.amount} UZS',
        f'VAT (0%):   0 UZS',
        '-----------------------------------',
        f'TOTAL PAID: {invoice.amount} UZS',
        '',
        'STATUS:    PAID & SECURED',
        '-----------------------------------',
        'Thank you for choosing Ridelux!',
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

def _build_receipt_pdf(receipt, user):
    transaction = receipt.transaction
    booking = transaction.booking
    
    lines = [
        'RIDELUX OFFICIAL RECEIPT',
        '-----------------------------------',
        f'RECEIPT NO: {receipt.receipt_number}',
        f'TXN ID:     {transaction.payment_code}',
        f'DATE:       {receipt.paid_at.strftime("%Y-%m-%d %H:%M")}',
        '',
        'PAYMENT FOR:',
        f'Customer:   {user.get_full_name() or user.username}',
        f'Vehicle:    {booking.car.model_info.brand} {booking.car.model_info.model_name}',
        '',
        'SUMMARY:',
        f'Paid Amount: {receipt.amount} UZS',
        f'Method:      {transaction.provider.upper()} ({transaction.method})',
        '-----------------------------------',
        'STATUS:      SUCCESSFUL',
        '-----------------------------------',
        'Keep this receipt for your records.',
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
