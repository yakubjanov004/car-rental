from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'avatar', 'is_staff', 'address', 'passport_image', 'driver_license_image', 'verification_status', 'loyalty_points')
        read_only_fields = ('id', 'is_staff', 'verification_status', 'loyalty_points')

    def update(self, instance, validated_data):
        # If user uploads a new document, change status to pending
        if 'passport_image' in validated_data or 'driver_license_image' in validated_data:
            instance.verification_status = 'pending'
        return super().update(instance, validated_data)

class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'phone_number')

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
