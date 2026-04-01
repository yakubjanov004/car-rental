from rest_framework import serializers
from .models import Car
from apps.districts.serializers import DistrictSerializer

class CarSerializer(serializers.ModelSerializer):
    district_info = DistrictSerializer(source='district', read_only=True)
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Car
        fields = '__all__'

    def get_main_image(self, obj):
        return obj.get_image_url
