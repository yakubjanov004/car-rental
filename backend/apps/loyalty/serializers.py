from rest_framework import serializers
from .models import LoyaltyTier, LoyaltyAccount, LoyaltyTransaction


class LoyaltyTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyTier
        fields = '__all__'


class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyTransaction
        fields = '__all__'


class LoyaltyAccountSerializer(serializers.ModelSerializer):
    tier = LoyaltyTierSerializer(read_only=True)
    transactions = LoyaltyTransactionSerializer(read_only=True, many=True)

    class Meta:
        model = LoyaltyAccount
        fields = '__all__'
