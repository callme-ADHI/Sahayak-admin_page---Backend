"""
marketplace/admin.py — Django Admin for marketplace models.
"""

from django.contrib import admin
from .models import Category, WorkerCategory, Address, Job, JobAssignment, JobStatusHistory


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ("name", "base_rate", "is_active", "display_order", "is_deleted")
    list_filter   = ("is_active", "is_deleted")
    search_fields = ("name",)


@admin.register(WorkerCategory)
class WorkerCategoryAdmin(admin.ModelAdmin):
    list_display  = ("worker", "category", "is_primary", "rate_override")
    list_filter   = ("is_primary", "category")
    search_fields = ("worker__user__phone", "category__name")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display  = ("user", "label", "city", "state", "is_default")
    list_filter   = ("city", "state")
    search_fields = ("user__phone", "city", "pincode")


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display  = ("id", "user", "category", "job_status",
                      "final_price", "scheduled_at", "is_deleted")
    list_filter   = ("job_status", "is_deleted")
    search_fields = ("user__phone", "category__name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(JobAssignment)
class JobAssignmentAdmin(admin.ModelAdmin):
    list_display  = ("job", "worker", "assignment_status",
                      "accepted_at", "completed_at")
    list_filter   = ("assignment_status",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(JobStatusHistory)
class JobStatusHistoryAdmin(admin.ModelAdmin):
    list_display  = ("job", "old_status", "new_status", "changed_by", "created_at")
    readonly_fields = ("created_at",)
