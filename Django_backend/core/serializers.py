"""
core/serializers.py
Auto-generated serializers for core models.
"""

from rest_framework import serializers
from .models import *



class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'


class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = '__all__'


class DailyStatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStatistic
        fields = '__all__'
