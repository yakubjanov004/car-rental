from django.contrib import admin
from .models import PricingRule


@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'rule_type', 'modifier_type', 'modifier_value', 'priority', 'is_active')
    list_filter = ('rule_type', 'modifier_type', 'is_active')
    search_fields = ('name',)
