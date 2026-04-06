from rest_framework import serializers
from .models import Booking, Fine, Waitlist

class WaitlistSerializer(serializers.ModelSerializer):
    car_name = serializers.CharField(source='car.model', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Waitlist
        fields = ['id', 'user', 'user_name', 'car', 'car_name', 'created_at', 'is_active']
        read_only_fields = ['user', 'created_at', 'is_active']
from apps.cars.serializers import CarSerializer

from django.db.models import Q

class BookingSerializer(serializers.ModelSerializer):
    car_info = CarSerializer(source='car', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('user', 'total_price', 'status')

    def validate(self, data):
        user = self.context['request'].user
        
        # Blacklist check
        if getattr(user, 'is_blacklisted', False):
            raise serializers.ValidationError("Kechirasiz, sizning hisobingiz qora ro'yxatga kiritilgan. Bron yaratish mumkin emas.")
        
        car = data.get('car')
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date:
            if start_date >= end_date:
                raise serializers.ValidationError({"end_date": "Qaytarish sanasi olish sanasidan keyin bo'lishi kerak."})
            
            # Overlap check
            overlapping = Booking.objects.filter(
                car=car,
                status__in=['pending', 'approved']
            ).filter(
                Q(start_date__lte=end_date) & Q(end_date__gte=start_date)
            )
            
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)
                
            if overlapping.exists():
                raise serializers.ValidationError("Ushbu avtomobil tanlangan sanalarda allaqachon band qilingan.")
                
        return data

    def create(self, validated_data):
        car = validated_data['car']
        start_date = validated_data['start_date']
        end_date = validated_data['end_date']
        is_chauffeur = validated_data.get('is_chauffeur', False)
        
        # Calculate total price
        days = (end_date - start_date).days
        if days <= 0:
            days = 1
            
        # Base car price
        base_price = car.daily_price * days
        
        # Add Chauffeur Fee (150,000 UZS per day)
        chauffeur_fee = 0
        if is_chauffeur:
            chauffeur_fee = 150000 * days
            
        validated_data['total_price'] = base_price + chauffeur_fee
        validated_data['user'] = self.context['request'].user
        
        return super().create(validated_data)

class FineSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    car_name = serializers.CharField(source='booking.car.model', read_only=True)

    class Meta:
        model = Fine
        fields = ['id', 'booking_id', 'car_name', 'amount', 'reason', 'status', 'issued_at', 'resolved_at']

