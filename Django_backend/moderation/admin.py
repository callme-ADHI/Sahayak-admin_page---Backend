"""
moderation/admin.py — Django Admin for moderation models.
"""

from django.contrib import admin
from .models import Report, BannedEntity, AdminAction, AuditLog


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display  = ("reporter", "report_type", "status",
                      "target_entity_type", "created_at")
    list_filter   = ("status", "report_type")
    search_fields = ("reporter__phone",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(BannedEntity)
class BannedEntityAdmin(admin.ModelAdmin):
    list_display  = ("entity_id", "entity_type", "is_active", "banned_by",
                      "expires_at", "created_at")
    list_filter   = ("entity_type", "is_active")
    readonly_fields = ("created_at", "updated_at")


@admin.register(AdminAction)
class AdminActionAdmin(admin.ModelAdmin):
    list_display  = ("admin_user", "action_type", "target_entity_type",
                      "target_entity_id", "created_at")
    list_filter   = ("action_type",)
    search_fields = ("admin_user__phone",)
    readonly_fields = ("created_at",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display  = ("action_type", "target_type", "admin", "ip_address", "created_at")
    list_filter   = ("action_type", "target_type")
    search_fields = ("admin__phone", "description")
    readonly_fields = ("id", "admin", "action_type", "target_type", "target_id",
                        "description", "ip_address", "user_agent",
                        "before_data", "after_data", "created_at")

    def has_change_permission(self, request, obj=None):
        """Audit logs are read-only from admin too."""
        return False

    def has_delete_permission(self, request, obj=None):
        return False
