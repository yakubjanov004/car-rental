from rest_framework import serializers
from .models import Car
from apps.districts.serializers import DistrictSerializer

class CarSerializer(serializers.ModelSerializer):
    district_info = DistrictSerializer(source='district', read_only=True)

    class Meta:
        model = Car
        fields = '__all__'
