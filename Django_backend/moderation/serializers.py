"""
moderation/serializers.py
Auto-generated serializers for moderation models.
"""

from rest_framework import serializers
from .models import *



class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'


class BannedEntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = BannedEntity
        fields = '__all__'


class AdminActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminAction
        fields = '__all__'


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
