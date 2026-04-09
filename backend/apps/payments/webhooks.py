"""
Webhook handlers for Payme and Click payment callbacks.

Payme Merchant API sends JSON-RPC requests to verify and perform transactions.
Click SHOP-API sends Prepare and Complete requests.

These endpoints must be publicly accessible and exempt from CSRF/JWT auth.
"""

import hashlib
import json
import logging
from decimal import Decimal

from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from apps.payments.models import PaymentTransaction
from apps.bookings.models import Booking

logger = logging.getLogger('apps.payments')


# ============================================================
#  PAYME MERCHANT API WEBHOOK
# ============================================================

@method_decorator(csrf_exempt, name='dispatch')
class PaymeWebhookView(View):
    """
    Handles Payme Merchant API callbacks (JSON-RPC 2.0).
    
    Methods handled:
      - CheckPerformTransaction
      - CreateTransaction
      - PerformTransaction
      - CancelTransaction
      - CheckTransaction
    """

    def post(self, request):
        # Verify Basic Auth
        if not self._authenticate(request):
            return JsonResponse({
                "error": {"code": -32504, "message": "Autentifikatsiya xatosi"},
                "id": None,
            }, status=200)

        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                "error": {"code": -32700, "message": "Parse error"},
                "id": None,
            }, status=200)

        method = body.get('method', '')
        params = body.get('params', {})
        rpc_id = body.get('id')

        handler = {
            'CheckPerformTransaction': self._check_perform,
            'CreateTransaction': self._create_transaction,
            'PerformTransaction': self._perform_transaction,
            'CancelTransaction': self._cancel_transaction,
            'CheckTransaction': self._check_transaction,
        }.get(method)

        if handler is None:
            return JsonResponse({
                "error": {"code": -32601, "message": f"Method not found: {method}"},
                "id": rpc_id,
            }, status=200)

        result = handler(params)
        return JsonResponse({"result": result, "id": rpc_id}, status=200)

    def _authenticate(self, request):
        """Verify Payme Basic Auth header."""
        import base64
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Basic '):
            return False
        try:
            decoded = base64.b64decode(auth_header[6:]).decode('utf-8')
            username, password = decoded.split(':', 1)
            expected_key = getattr(settings, 'PAYME_KEY', '')
            return password == expected_key
        except Exception:
            return False

    def _check_perform(self, params):
        """Check if a transaction can be performed for the given account."""
        account = params.get('account', {})
        order_id = account.get('order_id')
        amount = params.get('amount')

        if not order_id:
            return {"error": {"code": -31050, "message": "Order ID topilmadi"}}

        try:
            booking = Booking.objects.get(id=int(order_id))
        except Booking.DoesNotExist:
            return {"error": {"code": -31050, "message": "Buyurtma topilmadi"}}

        # Verify amount (in tiyins)
        expected_amount = int(booking.total_price * 100)
        if amount and int(amount) != expected_amount:
            return {"error": {"code": -31001, "message": "Noto'g'ri summa"}}

        return {"allow": True}

    def _create_transaction(self, params):
        """Create a Payme transaction record."""
        payme_id = params.get('id')
        account = params.get('account', {})
        order_id = account.get('order_id')
        amount = params.get('amount', 0)
        create_time = params.get('time')

        try:
            booking = Booking.objects.get(id=int(order_id))
        except Booking.DoesNotExist:
            return {"error": {"code": -31050, "message": "Buyurtma topilmadi"}}

        # Check for existing transaction with this payme_id
        txn = PaymentTransaction.objects.filter(
            metadata__payme_transaction_id=payme_id
        ).first()

        if txn:
            return {
                "create_time": int(txn.created_at.timestamp() * 1000),
                "transaction": str(txn.id),
                "state": 1,
            }

        # Create new transaction
        txn = PaymentTransaction.objects.create(
            user=booking.user,
            booking=booking,
            amount=Decimal(amount) / 100,  # Convert tiyins to UZS
            provider='payme',
            method='card',
            status='initiated',
            metadata={
                'payme_transaction_id': payme_id,
                'payme_create_time': create_time,
            }
        )

        return {
            "create_time": int(txn.created_at.timestamp() * 1000),
            "transaction": str(txn.id),
            "state": 1,
        }

    def _perform_transaction(self, params):
        """Mark a transaction as paid."""
        payme_id = params.get('id')

        txn = PaymentTransaction.objects.filter(
            metadata__payme_transaction_id=payme_id
        ).first()

        if not txn:
            return {"error": {"code": -31003, "message": "Tranzaksiya topilmadi"}}

        if txn.status == 'paid':
            return {
                "perform_time": int(txn.paid_at.timestamp() * 1000) if txn.paid_at else 0,
                "transaction": str(txn.id),
                "state": 2,
            }

        txn.status = 'paid'
        txn.paid_at = timezone.now()
        txn.save()

        # Update booking status
        if txn.booking:
            txn.booking.status = 'payment_pending'
            txn.booking.save()

        # Create invoice and receipt
        try:
            from services.payment_service import create_invoice_and_receipt
            create_invoice_and_receipt(txn.user, txn.booking, txn)
        except Exception as e:
            logger.error(f"Failed to create invoice/receipt for Payme TXN {txn.id}: {e}")

        logger.info(f"Payme transaction performed: TXN {txn.id}")

        return {
            "perform_time": int(txn.paid_at.timestamp() * 1000),
            "transaction": str(txn.id),
            "state": 2,
        }

    def _cancel_transaction(self, params):
        """Cancel a transaction."""
        payme_id = params.get('id')
        reason = params.get('reason', 0)

        txn = PaymentTransaction.objects.filter(
            metadata__payme_transaction_id=payme_id
        ).first()

        if not txn:
            return {"error": {"code": -31003, "message": "Tranzaksiya topilmadi"}}

        txn.status = 'refunded'
        txn.metadata['cancel_reason'] = reason
        txn.save()

        if txn.booking:
            txn.booking.status = 'cancelled'
            txn.booking.save()

        return {
            "cancel_time": int(timezone.now().timestamp() * 1000),
            "transaction": str(txn.id),
            "state": -1,
        }

    def _check_transaction(self, params):
        """Check transaction status."""
        payme_id = params.get('id')

        txn = PaymentTransaction.objects.filter(
            metadata__payme_transaction_id=payme_id
        ).first()

        if not txn:
            return {"error": {"code": -31003, "message": "Tranzaksiya topilmadi"}}

        state_map = {
            'initiated': 1,
            'otp_pending': 1,
            'authorized': 1,
            'paid': 2,
            'failed': -1,
            'refunded': -1,
        }

        return {
            "create_time": int(txn.created_at.timestamp() * 1000),
            "perform_time": int(txn.paid_at.timestamp() * 1000) if txn.paid_at else 0,
            "cancel_time": 0,
            "transaction": str(txn.id),
            "state": state_map.get(txn.status, 1),
        }


# ============================================================
#  CLICK SHOP-API WEBHOOK
# ============================================================

@method_decorator(csrf_exempt, name='dispatch')
class ClickWebhookView(View):
    """
    Handles Click SHOP-API Prepare and Complete callbacks.
    
    Click sends two requests:
      1. Prepare - to verify the order exists and amount matches
      2. Complete - to confirm the payment has been processed
    """

    def post(self, request):
        try:
            # Click sends form-encoded or JSON data
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.POST.dict()
        except Exception:
            return JsonResponse({"error": -1, "error_note": "Invalid request"})

        action = int(data.get('action', 0))

        if action == 0:  # Prepare
            return self._prepare(data)
        elif action == 1:  # Complete
            return self._complete(data)
        else:
            return JsonResponse({"error": -3, "error_note": "Unknown action"})

    def _verify_sign(self, data, action):
        """
        Verify Click's request signature.
        sign_string = click_trans_id + service_id + secret_key + merchant_trans_id + 
                      (merchant_prepare_id for complete) + amount + action + sign_time
        """
        secret_key = getattr(settings, 'CLICK_SECRET_KEY', '')
        
        click_trans_id = str(data.get('click_trans_id', ''))
        service_id = str(data.get('service_id', ''))
        merchant_trans_id = str(data.get('merchant_trans_id', ''))
        amount = str(data.get('amount', ''))
        sign_time = str(data.get('sign_time', ''))
        sign_string_received = str(data.get('sign_string', ''))

        if action == 0:  # Prepare
            sign_raw = f"{click_trans_id}{service_id}{secret_key}{merchant_trans_id}{amount}{action}{sign_time}"
        else:  # Complete
            merchant_prepare_id = str(data.get('merchant_prepare_id', ''))
            sign_raw = f"{click_trans_id}{service_id}{secret_key}{merchant_trans_id}{merchant_prepare_id}{amount}{action}{sign_time}"

        sign_computed = hashlib.md5(sign_raw.encode('utf-8')).hexdigest()
        return sign_computed == sign_string_received

    def _prepare(self, data):
        """
        Handle Click Prepare request.
        Validates order exists and amount is correct.
        """
        if not self._verify_sign(data, 0):
            return JsonResponse({
                "error": -1,
                "error_note": "SIGN CHECK FAILED",
            })

        merchant_trans_id = data.get('merchant_trans_id', '')
        amount = Decimal(str(data.get('amount', 0)))
        click_trans_id = data.get('click_trans_id', '')

        # Extract order_id from "order_123" format
        try:
            order_id = int(merchant_trans_id.replace('order_', ''))
            booking = Booking.objects.get(id=order_id)
        except (ValueError, Booking.DoesNotExist):
            return JsonResponse({
                "error": -5,
                "error_note": "Order not found",
                "click_trans_id": click_trans_id,
                "merchant_trans_id": merchant_trans_id,
            })

        # Verify amount
        if abs(float(booking.total_price) - float(amount)) > 1:
            return JsonResponse({
                "error": -2,
                "error_note": "Incorrect amount",
                "click_trans_id": click_trans_id,
                "merchant_trans_id": merchant_trans_id,
            })

        # Find or create transaction
        txn = PaymentTransaction.objects.filter(
            booking=booking, provider='click'
        ).exclude(status__in=['paid', 'refunded']).first()

        if not txn:
            txn = PaymentTransaction.objects.create(
                user=booking.user,
                booking=booking,
                amount=amount,
                provider='click',
                method='card',
                status='initiated',
                metadata={
                    'click_trans_id': click_trans_id,
                    'click_merchant_trans_id': merchant_trans_id,
                }
            )

        txn.metadata['click_trans_id'] = click_trans_id
        txn.save()

        return JsonResponse({
            "error": 0,
            "error_note": "Success",
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "merchant_prepare_id": txn.id,
        })

    def _complete(self, data):
        """
        Handle Click Complete request.
        Confirms the payment has been processed.
        """
        if not self._verify_sign(data, 1):
            return JsonResponse({
                "error": -1,
                "error_note": "SIGN CHECK FAILED",
            })

        merchant_prepare_id = data.get('merchant_prepare_id', '')
        click_trans_id = data.get('click_trans_id', '')
        merchant_trans_id = data.get('merchant_trans_id', '')
        error = int(data.get('error', 0))

        try:
            txn = PaymentTransaction.objects.get(id=int(merchant_prepare_id))
        except (ValueError, PaymentTransaction.DoesNotExist):
            return JsonResponse({
                "error": -6,
                "error_note": "Transaction not found",
                "click_trans_id": click_trans_id,
                "merchant_trans_id": merchant_trans_id,
            })

        if error < 0:
            # Click reports an error — payment failed
            txn.status = 'failed'
            txn.metadata['click_error'] = error
            txn.save()
            return JsonResponse({
                "error": -4,
                "error_note": "Payment failed by Click",
                "click_trans_id": click_trans_id,
                "merchant_trans_id": merchant_trans_id,
                "merchant_confirm_id": txn.id,
            })

        # Payment successful
        txn.status = 'paid'
        txn.paid_at = timezone.now()
        txn.metadata['click_trans_id'] = click_trans_id
        txn.save()

        # Update booking
        if txn.booking:
            txn.booking.status = 'payment_pending'
            txn.booking.save()

        # Create invoice and receipt
        try:
            from services.payment_service import create_invoice_and_receipt
            create_invoice_and_receipt(txn.user, txn.booking, txn)
        except Exception as e:
            logger.error(f"Failed to create invoice/receipt for Click TXN {txn.id}: {e}")

        logger.info(f"Click transaction completed: TXN {txn.id}")

        return JsonResponse({
            "error": 0,
            "error_note": "Success",
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "merchant_confirm_id": txn.id,
        })
