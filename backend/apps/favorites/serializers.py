from rest_framework import serializers
from .models import Favorite
from apps.cars.serializers import CarSerializer


class FavoriteSerializer(serializers.ModelSerializer):
    car_info = CarSerializer(source='car', read_only=True)

    class Meta:
        model = Favorite
        fields = ('id', 'user', 'car', 'car_info', 'created_at')
        read_only_fields = ('user',)
