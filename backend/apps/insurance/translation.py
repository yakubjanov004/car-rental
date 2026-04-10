from modeltranslation.translator import register, TranslationOptions
from .models import InsurancePlan

@register(InsurancePlan)
class InsurancePlanTranslationOptions(TranslationOptions):
    fields = ('name', 'description')
