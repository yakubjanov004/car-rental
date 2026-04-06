from django.contrib import admin
from .models import LoyaltyTier, LoyaltyAccount, LoyaltyTransaction


@admin.register(LoyaltyTier)
class LoyaltyTierAdmin(admin.ModelAdmin):
    list_display = ('name', 'min_points', 'max_points', 'discount_percentage')
    search_fields = ('name', 'slug')


@admin.register(LoyaltyAccount)
class LoyaltyAccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'points', 'lifetime_points', 'tier')
    search_fields = ('user__username',)


@admin.register(LoyaltyTransaction)
class LoyaltyTransactionAdmin(admin.ModelAdmin):
    list_display = ('account', 'transaction_type', 'points', 'balance_after', 'created_at')
    list_filter = ('transaction_type',)
