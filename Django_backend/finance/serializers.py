"""
finance/serializers.py
======================
Serializers for the finance app.
"""

from rest_framework import serializers
from .models import Wallet, Transaction, PlatformCommission, PaymentDispute, Rating


class WalletSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model  = Wallet
        fields = '__all__'
        read_only_fields = ['user_id', 'last_updated_at', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    # 'status' alias for transaction_status (frontend uses 'status')
    status           = serializers.CharField(source='transaction_status', read_only=True)
    from_user_phone  = serializers.CharField(source='from_user.phone',  read_only=True)
    to_user_phone    = serializers.CharField(source='to_user.phone',    read_only=True)

    class Meta:
        model  = Transaction
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class PlatformCommissionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PlatformCommission
        fields = '__all__'


class PaymentDisputeSerializer(serializers.ModelSerializer):
    raised_by_phone = serializers.CharField(source='raised_by.phone', read_only=True)

    class Meta:
        model  = PaymentDispute
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class RatingSerializer(serializers.ModelSerializer):
    from_user_phone = serializers.CharField(source='from_user.phone', read_only=True)
    to_user_phone   = serializers.CharField(source='to_user.phone',   read_only=True)

    class Meta:
        model  = Rating
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
