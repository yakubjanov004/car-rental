from django.contrib import admin
from .models import Car

from django.utils.html import format_html

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'brand', 'model', 'year', 'daily_price', 'category', 'is_available')
    list_filter = ('brand', 'category', 'fuel_type', 'is_available')
    search_fields = ('brand', 'model', 'category')
    ordering = ('-created_at',)
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        img_url = obj.get_image_url
        if img_url:
            return format_html('<img src="{}" style="width: 80px; height: auto; border-radius: 8px;" />', img_url)
        return "Rasm yo'q"
    
    image_preview.short_description = 'Rasm'
