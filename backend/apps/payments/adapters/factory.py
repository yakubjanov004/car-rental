from .mock import MockPaymentAdapter

def get_payment_adapter(provider_name):
    """
    Factory function to return the requested payment adapter.
    FOR DEMO: Always returns MockPaymentAdapter to avoid external API calls.
    """
    return MockPaymentAdapter()
