from django.contrib import admin
from .models import PaymentMethod, PaymentTransaction, DepositHold

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('user', 'card_type', 'masked_pan', 'is_default', 'is_verified')
    list_filter = ('card_type', 'is_default', 'is_verified')
    search_fields = ('user__username', 'masked_pan')

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('payment_code', 'user', 'amount', 'provider', 'method', 'status', 'created_at')
    list_filter = ('status', 'provider', 'method')
    search_fields = ('user__username', 'payment_code')

@admin.register(DepositHold)
class DepositHoldAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('user__username',)
