"""
core/admin.py — Django Admin for core system models.
"""

from django.contrib import admin
from .models import SystemSetting, AdminNotification, DailyStatistic


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display  = ("key", "category", "is_public", "is_editable", "updated_at")
    list_filter   = ("is_public", "is_editable", "category")
    search_fields = ("key", "category")
    readonly_fields = ("created_at", "updated_at")


@admin.register(AdminNotification)
class AdminNotificationAdmin(admin.ModelAdmin):
    list_display  = ("title", "priority", "is_read", "recipient", "created_at")
    list_filter   = ("priority", "is_read")
    search_fields = ("title",)
    readonly_fields = ("created_at",)


@admin.register(DailyStatistic)
class DailyStatisticAdmin(admin.ModelAdmin):
    list_display  = ("date", "total_bookings", "completed_bookings",
                      "total_revenue", "new_users", "new_workers")
    ordering      = ("-date",)
    readonly_fields = ("created_at", "updated_at")
