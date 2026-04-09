from .mock import MockPaymentAdapter
from .payme import PaymePaymentAdapter
from .click import ClickPaymentAdapter


def get_payment_adapter(provider_name):
    """
    Factory function to return the requested payment adapter.
    Supports: mock, payme, click
    """
    adapters = {
        'mock': MockPaymentAdapter,
        'payme': PaymePaymentAdapter,
        'click': ClickPaymentAdapter,
    }

    adapter_class = adapters.get(provider_name, MockPaymentAdapter)
    return adapter_class()
