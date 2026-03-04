"""
accounts/admin.py
=================
Django Admin registrations for all identity & access models.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile, UserRole, Role, WorkerProfile, VerificationRequest


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin panel for the User model."""

    list_display  = ("phone", "email", "account_status", "is_verified",
                      "is_staff", "is_deleted", "date_joined")
    list_filter   = ("account_status", "is_staff", "is_superuser",
                      "is_verified", "is_deleted")
    search_fields = ("phone", "email")
    ordering      = ("-date_joined",)
    readonly_fields = ("date_joined", "updated_at", "last_login")

    fieldsets = (
        (None, {"fields": ("phone", "email", "password")}),
        (_("Status"), {"fields": ("account_status", "is_verified",
                                   "is_active", "is_deleted", "deleted_at")}),
        (_("Permissions"), {"fields": ("is_staff", "is_superuser",
                                        "groups", "user_permissions")}),
        (_("Timestamps"), {"fields": ("date_joined", "last_login", "updated_at")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("phone", "email", "password1", "password2",
                       "account_status", "is_staff"),
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ("user", "full_name", "gender")
    search_fields = ("full_name", "user__phone")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("role_name", "description")


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display  = ("user", "role", "is_active", "assigned_at")
    list_filter   = ("is_active", "role")
    search_fields = ("user__phone",)


@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display  = ("user", "worker_status", "is_available",
                      "average_rating", "total_jobs_completed", "is_deleted")
    list_filter   = ("worker_status", "is_available", "is_deleted")
    search_fields = ("user__phone", "government_id_number")
    readonly_fields = ("created_at", "updated_at")


@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display  = ("worker", "request_type", "status", "reviewed_by", "created_at")
    list_filter   = ("status", "request_type")
    readonly_fields = ("created_at", "updated_at")
