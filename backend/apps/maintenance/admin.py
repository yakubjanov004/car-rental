from django.contrib import admin
from .models import MaintenanceType, MaintenanceRecord


@admin.register(MaintenanceType)
class MaintenanceTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = ('car', 'maintenance_type', 'scheduled_date', 'status', 'cost')
    list_filter = ('status', 'maintenance_type')
    search_fields = ('car__inventory_code', 'car__plate_number', 'performed_by')
