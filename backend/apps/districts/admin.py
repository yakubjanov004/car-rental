from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .models import District

@admin.register(District)
class DistrictAdmin(TranslationAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)
