from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .models import Car, CarModel, CarImage, Amenity

class CarImageInline(admin.TabularInline):
    model = CarImage
    extra = 1

@admin.register(CarModel)
class CarModelAdmin(TranslationAdmin):
    list_display = ('brand', 'model_name', 'category', 'model_group')
    search_fields = ('brand', 'model_name')
    inlines = [CarImageInline]

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('id', 'display_name', 'plate_number', 'inventory_code', 'color_name', 'status', 'is_available')
    list_filter = ('model_info__brand', 'status', 'is_available', 'district')
    search_fields = ('plate_number', 'inventory_code', 'model_info__model_name')
    
    def display_name(self, obj):
        return f"{obj.model_info.brand} {obj.model_info.model_name}"
    display_name.short_description = 'Car Model'

@admin.register(CarImage)
class CarImageAdmin(admin.ModelAdmin):
    list_display = ('car_model', 'slot', 'sort_order', 'is_active')

@admin.register(Amenity)
class AmenityAdmin(TranslationAdmin):
    list_display = ('name', 'code', 'icon_name')
