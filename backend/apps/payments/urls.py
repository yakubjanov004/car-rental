from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentMethodViewSet, PaymentTransactionViewSet, DepositHoldViewSet, 
    PromoCodeViewSet, BillingInvoiceViewSet, PaymentReceiptViewSet, RefundRequestViewSet,
    InitiatePaymentView, VerifyOTPView, CheckPaymentStatusView,
)
from .webhooks import PaymeWebhookView, ClickWebhookView

router = DefaultRouter()
router.register(r'methods', PaymentMethodViewSet, basename='payment-methods')
router.register(r'transactions', PaymentTransactionViewSet, basename='payment-transactions')
router.register(r'deposits', DepositHoldViewSet, basename='deposit-holds')
router.register(r'promos', PromoCodeViewSet, basename='promo')
router.register(r'invoices', BillingInvoiceViewSet, basename='invoices')
router.register(r'receipts', PaymentReceiptViewSet, basename='receipts')
router.register(r'refunds', RefundRequestViewSet, basename='refunds')

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),
    path('verify-otp/', VerifyOTPView.as_view(), name='payment-verify-otp'),
    path('verify/', CheckPaymentStatusView.as_view(), name='payment-verify'),

    # Webhook endpoints for payment providers (publicly accessible)
    path('webhook/payme/', PaymeWebhookView.as_view(), name='payme-webhook'),
    path('webhook/click/', ClickWebhookView.as_view(), name='click-webhook'),

    path('', include(router.urls)),
]
