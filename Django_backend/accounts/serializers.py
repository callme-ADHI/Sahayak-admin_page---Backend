"""
accounts/serializers.py
=======================
Production-grade serializers for the accounts app.
All field names match what the React Admin frontend expects.

KEY DECISIONS:
  - WorkerProfileSerializer embeds user.phone and user.profile.full_name
    so the frontend can display name/phone without extra requests.
  - UserSerializer excludes password entirely.
  - status alias: account_status exposed as 'status' via SerializerMethodField
    for backwards compatibility with frontend field names.
"""

from rest_framework import serializers
from .models import User, UserProfile, Role, UserRole, WorkerProfile, VerificationRequest


# ─── User ──────────────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    # Alias account_status → status (frontend expects 'status')
    status = serializers.CharField(source='account_status', read_only=True)
    name   = serializers.SerializerMethodField()

    def get_name(self, obj):
        """Return full_name from profile if available."""
        try:
            return obj.profile.full_name or ''
        except UserProfile.DoesNotExist:
            return ''

    class Meta:
        model  = User
        fields = [
            'id', 'phone', 'email', 'status', 'account_status', 'name',
            'is_verified', 'is_active', 'is_staff', 'is_superuser',
            'is_deleted', 'deleted_at', 'date_joined', 'updated_at', 'last_login',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'updated_at']


class UserWriteSerializer(serializers.ModelSerializer):
    """Used for PATCH/PUT — excludes computed fields."""
    class Meta:
        model  = User
        fields = ['phone', 'email', 'account_status', 'is_verified', 'is_active']


# ─── UserProfile ───────────────────────────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = UserProfile
        fields = '__all__'


# ─── Role ──────────────────────────────────────────────────────────────────────

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Role
        fields = '__all__'


# ─── UserRole ──────────────────────────────────────────────────────────────────

class UserRoleSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.role_name', read_only=True)

    class Meta:
        model  = UserRole
        fields = '__all__'


# ─── WorkerProfile ─────────────────────────────────────────────────────────────

class WorkerProfileSerializer(serializers.ModelSerializer):
    # These fields come from the related User model
    phone  = serializers.CharField(source='user.phone',  read_only=True)
    email  = serializers.CharField(source='user.email',  read_only=True)
    name   = serializers.SerializerMethodField()
    # Alias worker_status → status for frontend compatibility
    status = serializers.CharField(source='worker_status', read_only=True)
    # verification_status maps to worker_status for legacy frontend use
    verification_status = serializers.SerializerMethodField()

    def get_name(self, obj):
        try:
            return obj.user.profile.full_name or ''
        except Exception:
            return ''

    def get_verification_status(self, obj):
        """Legacy field: map worker_status to frontend's verification_status."""
        # Workers in 'pending' state are awaiting verification
        return obj.worker_status if obj.worker_status in ('pending', 'approved') else obj.worker_status

    class Meta:
        model  = WorkerProfile
        fields = [
            'user_id', 'phone', 'email', 'name', 'status', 'worker_status',
            'verification_status', 'government_id_type', 'government_id_number',
            'experience_years', 'bio', 'average_rating', 'total_jobs_completed',
            'is_available', 'is_deleted', 'created_at', 'updated_at',
        ]
        read_only_fields = ['user_id', 'average_rating', 'total_jobs_completed', 'created_at', 'updated_at']


# ─── VerificationRequest ───────────────────────────────────────────────────────

class VerificationRequestSerializer(serializers.ModelSerializer):
    worker_phone = serializers.CharField(source='worker.user.phone', read_only=True)
    worker_name  = serializers.SerializerMethodField()

    def get_worker_name(self, obj):
        try:
            return obj.worker.user.profile.full_name or ''
        except Exception:
            return ''

    class Meta:
        model  = VerificationRequest
        fields = '__all__'
