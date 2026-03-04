"""
marketplace/serializers.py
==========================
Serializers for the marketplace app.
Field names are aligned with the React Admin frontend expectations.
"""

from rest_framework import serializers
from .models import Category, WorkerCategory, Address, Job, JobAssignment, JobStatusHistory


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = '__all__'


class WorkerCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model  = WorkerCategory
        fields = '__all__'


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Address
        fields = '__all__'


class JobSerializer(serializers.ModelSerializer):
    # 'status' alias for booking_status (frontend compatibility)
    booking_status = serializers.CharField(source='job_status', read_only=True)
    # user fields
    user_phone  = serializers.CharField(source='user.phone', read_only=True)
    user_name   = serializers.SerializerMethodField()
    # category field
    category_name = serializers.CharField(source='category.name', read_only=True)
    # address field
    address_label = serializers.SerializerMethodField()

    def get_user_name(self, obj):
        try:
            return obj.user.profile.full_name or ''
        except Exception:
            return ''

    def get_address_label(self, obj):
        if obj.address:
            return f"{obj.address.address_line}, {obj.address.city}"
        return ''

    class Meta:
        model  = Job
        fields = [
            'id', 'user', 'user_phone', 'user_name', 'category', 'category_name',
            'address', 'address_label', 'job_status', 'booking_status',
            'final_price', 'description', 'scheduled_at',
            'cancellation_reason', 'is_deleted', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class JobAssignmentSerializer(serializers.ModelSerializer):
    worker_phone = serializers.CharField(source='worker.user.phone', read_only=True)
    worker_name  = serializers.SerializerMethodField()

    def get_worker_name(self, obj):
        try:
            return obj.worker.user.profile.full_name or ''
        except Exception:
            return ''

    class Meta:
        model  = JobAssignment
        fields = '__all__'


class JobStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = JobStatusHistory
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
