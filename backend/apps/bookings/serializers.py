from rest_framework import serializers
from .models import Booking
from apps.cars.serializers import CarSerializer

class BookingSerializer(serializers.ModelSerializer):
    car_info = CarSerializer(source='car', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('user', 'total_price', 'status')

    def create(self, validated_data):
        car = validated_data['car']
        start_date = validated_data['start_date']
        end_date = validated_data['end_date']
        
        # Calculate total price
        days = (end_date - start_date).days
        if days <= 0:
            days = 1
        validated_data['total_price'] = car.daily_price * days
        validated_data['user'] = self.context['request'].user
        
        return super().create(validated_data)
