from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ('id', 'user', 'car', 'rating', 'comment', 'user_name', 'created_at')
        read_only_fields = ('user', 'car')

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating 1 dan 5 gacha bo'lishi kerak.")
        return value
