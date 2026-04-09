from abc import ABC, abstractmethod

class BasePaymentAdapter(ABC):
    """
    Abstract Base Class for Payment Gateways.
    All adapters (Mock, Stripe, Payme, Click) should implement these methods.
    """
    
    @abstractmethod
    def initiate_payment(self, transaction):
        """Initializes payment with the provider."""
        pass

    @abstractmethod
    def verify_otp(self, transaction, otp_code):
        """Verifies OTP if applicable."""
        pass

    @abstractmethod
    def capture_payment(self, transaction):
        """Finalizes/Captures the payment."""
        pass

    @abstractmethod
    def refund_payment(self, transaction, amount=None):
        """Refunds a previous payment."""
        pass
