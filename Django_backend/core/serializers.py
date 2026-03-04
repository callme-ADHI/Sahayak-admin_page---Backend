"""
core/serializers.py
===================
Serializers for the core app.
"""

from rest_framework import serializers
from .models import SystemSetting, AdminNotification, DailyStatistic


class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SystemSetting
        fields = '__all__'


class AdminNotificationSerializer(serializers.ModelSerializer):
    # Frontend uses 'admin_id' but Django model uses 'recipient_id'
    admin_id = serializers.UUIDField(source='recipient_id', read_only=True)

    class Meta:
        model  = AdminNotification
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class DailyStatisticSerializer(serializers.ModelSerializer):
    # Frontend uses worker_earnings — map to total_payouts
    worker_earnings = serializers.DecimalField(
        source='total_payouts', max_digits=15, decimal_places=2, read_only=True
    )

    class Meta:
        model  = DailyStatistic
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
