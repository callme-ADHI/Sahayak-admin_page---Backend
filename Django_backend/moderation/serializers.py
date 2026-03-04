"""
moderation/serializers.py
=========================
Serializers for moderation app.
Aligns field names with the React Admin frontend.
"""

from rest_framework import serializers
from .models import Report, BannedEntity, AdminAction, AuditLog


class ReportSerializer(serializers.ModelSerializer):
    reporter_phone = serializers.CharField(source='reporter.phone', read_only=True)

    class Meta:
        model  = Report
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class BannedEntitySerializer(serializers.ModelSerializer):
    banned_by_phone = serializers.CharField(source='banned_by.phone', read_only=True)

    class Meta:
        model  = BannedEntity
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminActionSerializer(serializers.ModelSerializer):
    admin_phone = serializers.CharField(source='admin_user.phone', read_only=True)
    admin_name  = serializers.SerializerMethodField()

    def get_admin_name(self, obj):
        try:
            return obj.admin_user.profile.full_name or obj.admin_user.phone
        except Exception:
            return obj.admin_user.phone

    class Meta:
        model  = AdminAction
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class AuditLogSerializer(serializers.ModelSerializer):
    # Frontend expects 'admins.name' nested — expose as admin_name
    admin_name  = serializers.SerializerMethodField()
    admin_phone = serializers.CharField(source='admin.phone', read_only=True)

    def get_admin_name(self, obj):
        if obj.admin:
            try:
                return obj.admin.profile.full_name or obj.admin.phone
            except Exception:
                return obj.admin.phone
        return 'System'

    class Meta:
        model  = AuditLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
