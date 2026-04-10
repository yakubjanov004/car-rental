from modeltranslation.translator import register, TranslationOptions
from .models import CarModel, Amenity

@register(Amenity)
class AmenityTranslationOptions(TranslationOptions):
    fields = ('name',)

@register(CarModel)
class CarModelTranslationOptions(TranslationOptions):
    fields = (
        'short_tagline',
        'short_description',
        'detail_title',
        'detail_summary',
        'rear_title',
        'rear_description',
        'interior_title',
        'interior_description',
    )
