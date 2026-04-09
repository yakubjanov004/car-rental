import random
from django.utils import timezone
from .base import BasePaymentAdapter

class MockPaymentAdapter(BasePaymentAdapter):
    """
    Mock implementation of the payment gateway.
    Handles fake OTP generation and simulation of success/failed states.
    """
    
    def initiate_payment(self, transaction):
        # Simulate OTP generation
        otp = str(random.randint(100000, 999999))
        transaction.otp_code = otp
        transaction.status = 'otp_pending'
        transaction.metadata.update({
            'gateway_ref': f"MOCK-REF-{random.randint(1000, 9999)}",
            'debug_otp': otp  # For demo purposes
        })
        transaction.save()
        return {'status': 'success', 'otp_required': True}

    def verify_otp(self, transaction, otp_code):
        if otp_code == transaction.otp_code:
            transaction.status = 'authorized'
            transaction.save()
            return {'status': 'success'}
        else:
            transaction.status = 'failed'
            transaction.metadata.update({'error': 'Invalid OTP'})
            transaction.save()
            return {'status': 'error', 'message': 'Noto\'g\'ri OTP kod'}

    def capture_payment(self, transaction):
        if transaction.status == 'authorized':
            transaction.status = 'paid'
            transaction.paid_at = timezone.now()
            transaction.save()
            return {'status': 'success'}
        return {'status': 'error', 'message': 'To\'lov avtorizatsiya qilinmagan'}

    def refund_payment(self, transaction, amount=None):
        if transaction.status == 'paid':
            transaction.status = 'refunded'
            transaction.save()
            return {'status': 'success'}
        return {'status': 'error', 'message': 'To\'lovni qaytarib bo\'lmaydi'}
