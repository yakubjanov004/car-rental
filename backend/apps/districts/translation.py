from modeltranslation.translator import register, TranslationOptions
from .models import District

@register(District)
class DistrictTranslationOptions(TranslationOptions):
    fields = ('name',)
