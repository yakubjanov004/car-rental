from rest_framework import serializers
from .models import PaymentMethod, PaymentTransaction, DepositHold, BillingInvoice, PaymentReceipt, RefundRequest

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'card_type', 'masked_pan', 'expiry_month', 'expiry_year', 'card_holder', 'is_default', 'is_verified', 'created_at']
        read_only_fields = ['id', 'is_verified', 'created_at']

class PaymentTransactionSerializer(serializers.ModelSerializer):
    payment_method = PaymentMethodSerializer(read_only=True)
    
    class Meta:
        model = PaymentTransaction
        fields = ['id', 'booking', 'amount', 'payment_type', 'payment_method', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

class BillingInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingInvoice
        fields = ['id', 'booking', 'transaction', 'invoice_number', 'amount', 'tax_amount', 'created_at']
        read_only_fields = ['id', 'invoice_number', 'created_at']

class PaymentReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentReceipt
        fields = ['id', 'invoice', 'receipt_number', 'paid_at', 'pdf_url']
        read_only_fields = ['id', 'receipt_number', 'paid_at']

class RefundRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefundRequest
        fields = ['id', 'transaction', 'amount', 'reason', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

class DepositHoldSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepositHold
        fields = ['id', 'booking', 'amount', 'status', 'created_at', 'released_at']
        read_only_fields = ['id', 'status', 'created_at', 'released_at']
