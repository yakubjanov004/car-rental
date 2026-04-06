from django.contrib import admin
from .models import InsurancePlan, BookingInsurance


@admin.register(InsurancePlan)
class InsurancePlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'coverage_level', 'daily_price', 'is_active', 'sort_order')
    list_filter = ('coverage_level', 'is_active')
    search_fields = ('name', 'slug')


@admin.register(BookingInsurance)
class BookingInsuranceAdmin(admin.ModelAdmin):
    list_display = ('policy_number', 'booking', 'plan', 'total_cost', 'expires_at')
    search_fields = ('policy_number', 'booking__id')
