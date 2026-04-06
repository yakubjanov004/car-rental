from rest_framework import serializers
from .models import InsurancePlan, BookingInsurance


class InsurancePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsurancePlan
        fields = '__all__'


class BookingInsuranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingInsurance
        fields = '__all__'
        read_only_fields = ('policy_number', 'issued_at', 'total_cost')
