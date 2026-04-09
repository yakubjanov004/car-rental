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
    invoice_id = serializers.SerializerMethodField()
    invoice_number = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('user', 'total_price', 'status')

    def get_invoice_id(self, obj):
        invoice = obj.invoices.first()
        return invoice.id if invoice else None

    def get_invoice_number(self, obj):
        invoice = obj.invoices.first()
        return invoice.invoice_number if invoice else None

    def validate(self, data):
        user = self.context['request'].user
        
        # KYC check
        if not hasattr(user, 'kyc') or user.kyc.status != 'approved':
            raise serializers.ValidationError("Ma'lumotlaringiz tasdiqlanmagan. Bron qilish uchun KYC tekshiruvidan o'tishingiz shart.")
        
        # Blacklist check
        if getattr(user, 'is_blacklisted', False):
            raise serializers.ValidationError("Hisobingiz qora ro'yxatga olingan.")
        
        car = data.get('car')
        start = data.get('start_datetime')
        end = data.get('end_datetime')

        if start and end:
            if start >= end:
                raise serializers.ValidationError({"end_datetime": "Qaytarish vaqti olish vaqtidan keyin bo'lishi kerak."})
            
            overlapping = Booking.objects.filter(
                car=car,
                status__in=['pending', 'payment_pending', 'confirmed', 'active']
            ).filter(
                Q(start_datetime__lt=end) & Q(end_datetime__gt=start)
            )
            
            # Maintenance check
            from apps.cars.models import MaintenanceRecord
            maintenance = MaintenanceRecord.objects.filter(
                car=car
            ).filter(
                Q(start_datetime__lt=end) & Q(end_datetime__gt=start)
            )
            
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)
                
            if overlapping.exists() or maintenance.exists():
                raise serializers.ValidationError("Ushbu avtomobil tanlangan vaqtda band (bron yoki texnik xizmat).")
                
        return data

    def create(self, validated_data):
        car = validated_data['car']
        start = validated_data['start_datetime']
        end = validated_data['end_datetime']
        is_chauffeur = validated_data.get('is_chauffeur', False)
        
        # Calculate duration in days (including partial days as full days)
        duration = end - start
        days = max(1, (duration.days + (1 if duration.seconds > 0 else 0)))
            
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

