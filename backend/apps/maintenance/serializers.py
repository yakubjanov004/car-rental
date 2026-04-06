from rest_framework import serializers
from .models import MaintenanceType, MaintenanceRecord


class MaintenanceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceType
        fields = '__all__'


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = '__all__'
