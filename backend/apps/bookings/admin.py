from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking_code', 'user', 'car', 'start_datetime', 'end_datetime', 'total_price', 'status')
    list_filter = ('status', 'start_datetime')
    search_fields = ('booking_code', 'user__username', 'car__model', 'full_name', 'phone_number')
    readonly_fields = ('created_at',)
