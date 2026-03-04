"""
finance/serializers.py
Auto-generated serializers for finance models.
"""

from rest_framework import serializers
from .models import *



class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'


class PlatformCommissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformCommission
        fields = '__all__'


class PaymentDisputeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentDispute
        fields = '__all__'


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'
