from rest_framework import serializers
from .models import KYCProfile

class KYCProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCProfile
        fields = [
            'id', 'status', 'full_name', 'date_of_birth', 'nationality',
            'passport_series', 'passport_issued_by', 'passport_issue_date', 'passport_expiry_date',
            'passport_front_image', 'passport_back_image',
            'license_number', 'license_category', 'license_issue_date', 'license_expiry_date',
            'license_image', 'selfie_with_document',
            'rejection_reason', 'submitted_at', 'created_at', 'updated_at', 'is_valid'
        ]
        read_only_fields = ['id', 'status', 'rejection_reason', 'submitted_at', 'created_at', 'updated_at', 'is_valid']

class KYCSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCProfile
        fields = ['full_name', 'date_of_birth', 'nationality', 'passport_series', 'license_number']

class KYCReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['approved', 'rejected'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
