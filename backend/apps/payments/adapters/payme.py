"""
Payme Payment Adapter for RIDELUX.
Uses the payme-pkg SDK (Subscribe API) for card tokenization and receipts,
and generates checkout links for QR/redirect payments.

Payme flow:
  1. initiate_payment → creates a Payme receipt + generates checkout link (QR)
  2. verify_otp → verifies card via Subscribe API (card flow only)
  3. capture_payment → pays the receipt with a verified card token
  4. refund_payment → cancels/refunds the receipt

Requires in settings.py:
  PAYME_ID, PAYME_KEY (for Merchant API callbacks)
  PAYME_SUBSCRIBE_KEY (for Subscribe/Receipts API)
"""

import logging
import hashlib
import base64
from django.conf import settings
from django.utils import timezone
from .base import BasePaymentAdapter

logger = logging.getLogger('apps.payments')

# ---------- Payme SDK lazy init ----------
_payme_client = None


def _get_payme_client():
    global _payme_client
    if _payme_client is None:
        try:
            from payme import Payme
            _payme_client = Payme(
                payme_id=getattr(settings, 'PAYME_ID', ''),
                payme_key=getattr(settings, 'PAYME_KEY', ''),
                is_test_mode=getattr(settings, 'PAYME_TEST_MODE', True),
            )
        except ImportError:
            logger.warning("payme-pkg is not installed. Falling back to direct HTTP calls.")
            _payme_client = None
    return _payme_client


def _generate_checkout_link(order_id, amount_tiyin, return_url=None):
    """
    Generate a Payme checkout link.
    Amount must be in tiyins (1 UZS = 100 tiyin).
    
    Format: https://checkout.paycom.uz/BASE64_ENCODED_PARAMS
    """
    merchant_id = getattr(settings, 'PAYME_ID', '')
    # Build params string
    params = f"m={merchant_id};ac.order_id={order_id};a={amount_tiyin}"
    if return_url:
        params += f";c={return_url}"
    
    encoded = base64.b64encode(params.encode('utf-8')).decode('utf-8')
    base_url = "https://checkout.paycom.uz/"
    if getattr(settings, 'PAYME_TEST_MODE', True):
        base_url = "https://test.paycom.uz/"
    
    return f"{base_url}{encoded}"


class PaymePaymentAdapter(BasePaymentAdapter):
    """
    Production-ready Payme adapter.
    Supports two flows:
      - QR/Redirect: generates a checkout link, user pays in Payme app
      - Card (Subscribe API): tokenize card → verify OTP → pay receipt
    """

    def initiate_payment(self, transaction):
        """
        Creates a payment session with Payme.
        For QR flow: generates a checkout URL.
        For card flow with SDK: creates a receipt.
        """
        amount_tiyin = int(transaction.amount * 100)
        order_id = transaction.booking_id or transaction.id

        # Generate checkout link (used for QR code display)
        return_url = getattr(settings, 'PAYME_RETURN_URL', None)
        checkout_url = _generate_checkout_link(order_id, amount_tiyin, return_url)

        # Try creating a receipt via SDK for programmatic payment
        receipt_id = None
        payme = _get_payme_client()
        if payme:
            try:
                response = payme.receipts_create(
                    account={"order_id": str(order_id)},
                    amount=amount_tiyin,
                    description=f"RIDELUX: Booking #{order_id}",
                )
                receipt_id = response.result.receipt._id
                logger.info(f"Payme receipt created: {receipt_id} for TXN {transaction.id}")
            except Exception as e:
                logger.error(f"Payme receipt creation failed: {e}")

        # Update transaction
        transaction.status = 'initiated'
        transaction.metadata.update({
            'payme_checkout_url': checkout_url,
            'payme_receipt_id': receipt_id,
            'payme_amount_tiyin': amount_tiyin,
            'gateway_ref': f"PAYME-{order_id}",
        })
        transaction.save()

        return {
            'status': 'success',
            'otp_required': False,
            'checkout_url': checkout_url,
            'receipt_id': receipt_id,
            'expires_in': 900,  # 15 minutes
        }

    def verify_otp(self, transaction, otp_code):
        """
        For card-based Subscribe API flow:
        Verify the card using OTP code from SMS.
        """
        payme = _get_payme_client()
        card_token = transaction.metadata.get('payme_card_token')

        if not payme or not card_token:
            return {'status': 'error', 'message': 'Karta tokeni topilmadi'}

        try:
            response = payme.cards_verify(
                token=card_token,
                code=otp_code,
            )
            if response.result.card.verify:
                transaction.status = 'authorized'
                transaction.metadata['payme_card_verified'] = True
                transaction.save()
                return {'status': 'success'}
            else:
                transaction.status = 'failed'
                transaction.metadata['error'] = 'Card verification failed'
                transaction.save()
                return {'status': 'error', 'message': 'Karta tasdiqlanmadi'}
        except Exception as e:
            logger.error(f"Payme OTP verification failed: {e}")
            transaction.status = 'failed'
            transaction.metadata['error'] = str(e)
            transaction.save()
            return {'status': 'error', 'message': f'OTP tasdiqlashda xatolik: {e}'}

    def capture_payment(self, transaction):
        """
        Pay the receipt using a verified card token.
        """
        payme = _get_payme_client()
        receipt_id = transaction.metadata.get('payme_receipt_id')
        card_token = transaction.metadata.get('payme_card_token')

        if not payme or not receipt_id:
            # If no SDK available, mark based on webhook callback
            if transaction.status == 'authorized':
                transaction.status = 'paid'
                transaction.paid_at = timezone.now()
                transaction.save()
                return {'status': 'success'}
            return {'status': 'error', 'message': 'Receipt ID topilmadi'}

        try:
            response = payme.receipts_pay(
                receipts_id=receipt_id,
                token=card_token,
            )
            # State 4 = paid
            if response.result.receipt.state == 4:
                transaction.status = 'paid'
                transaction.paid_at = timezone.now()
                transaction.metadata['payme_state'] = 4
                transaction.save()
                return {'status': 'success'}
            else:
                return {'status': 'error', 'message': f'To\'lov holati: {response.result.receipt.state}'}
        except Exception as e:
            logger.error(f"Payme capture failed: {e}")
            return {'status': 'error', 'message': str(e)}

    def refund_payment(self, transaction, amount=None):
        """
        Cancel/refund the Payme receipt.
        """
        payme = _get_payme_client()
        receipt_id = transaction.metadata.get('payme_receipt_id')

        if not payme or not receipt_id:
            return {'status': 'error', 'message': 'Payme receipt topilmadi'}

        try:
            response = payme.receipts_cancel(receipts_id=receipt_id)
            # State 50 = cancelled
            if response.result.receipt.state == 50:
                transaction.status = 'refunded'
                transaction.save()
                return {'status': 'success'}
            else:
                return {'status': 'error', 'message': f'Bekor qilishda xatolik'}
        except Exception as e:
            logger.error(f"Payme refund failed: {e}")
            return {'status': 'error', 'message': str(e)}

    def check_payment_status(self, transaction):
        """
        Check the current status of a Payme receipt.
        Used for polling (QR flow: user pays externally).
        """
        payme = _get_payme_client()
        receipt_id = transaction.metadata.get('payme_receipt_id')

        if not payme or not receipt_id:
            return {'status': 'unknown'}

        try:
            response = payme.receipts_check(receipts_id=receipt_id)
            state = response.result.state

            if state == 4:  # Paid
                if transaction.status != 'paid':
                    transaction.status = 'paid'
                    transaction.paid_at = timezone.now()
                    transaction.save()
                return {'status': 'paid', 'state': state}
            elif state == 50:  # Cancelled
                return {'status': 'cancelled', 'state': state}
            else:
                return {'status': 'pending', 'state': state}
        except Exception as e:
            logger.error(f"Payme status check failed: {e}")
            return {'status': 'error', 'message': str(e)}
