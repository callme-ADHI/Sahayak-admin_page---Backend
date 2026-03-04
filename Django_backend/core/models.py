"""
core/models.py
==============
System Infrastructure Layer — Platform configuration and operational data.

Tables defined here:
  - system_settings      → Key-value platform config store
  - admin_notifications  → Internal admin alert system
  - daily_statistics     → Pre-aggregated analytics cache

ARCHITECTURAL DECISIONS:
  ▸ system_settings uses TEXT primary key (matches original schema)
  ▸ JSONField replaces Supabase's jsonb — full Django ORM support
  ▸ daily_statistics is a write-occasionally, read-often table
    (populated via management command or Celery periodic task)
  ▸ admin_notifications are lightweight in-app alerts (not email)
"""

import uuid
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


# ══════════════════════════════════════════════════════════════════════════════
# SYSTEM SETTING  (maps to TABLE: system_settings)
# ══════════════════════════════════════════════════════════════════════════════

class SystemSetting(models.Model):
    """
    Dynamic platform configuration as a key-value store.
    Admins can modify settings at runtime without redeploying.

    Examples:
      key='maintenance_mode'   → value={"enabled": true}
      key='platform_fee_pct'   → value={"percentage": 15}
      key='supported_cities'   → value=["Mumbai", "Delhi", "Bangalore"]

    Table name: system_settings
    """

    key = models.TextField(
        primary_key=True,
        verbose_name=_("Setting Key"),
        help_text=_("Unique configuration identifier (e.g. 'maintenance_mode')."),
    )
    value       = models.JSONField(verbose_name=_("Setting Value"))
    description = models.TextField(blank=True,
                                    verbose_name=_("Usage Description"))
    category    = models.CharField(max_length=50, blank=True, db_index=True,
                                    help_text=_("Grouping label for admin UI."))
    is_public   = models.BooleanField(
        default=False,
        verbose_name=_("Exposed to Public API"),
        help_text=_("If True, this setting is readable by the frontend."),
    )
    is_editable = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "system_settings"
        verbose_name = _("System Setting")
        verbose_name_plural = _("System Settings")
        ordering = ["category", "key"]

    def __str__(self):
        return f"Setting: {self.key}"


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN NOTIFICATION  (maps to TABLE: admin_notifications)
# ══════════════════════════════════════════════════════════════════════════════

class NotificationPriority(models.TextChoices):
    LOW      = "low",      _("Low")
    NORMAL   = "normal",   _("Normal")
    HIGH     = "high",     _("High")
    CRITICAL = "critical", _("Critical")


class AdminNotification(models.Model):
    """
    In-app alerts delivered to admin dashboard users.
    Not email — these are in-dashboard notification bell items.

    Examples: "New worker verification pending", "System error detected"

    Table name: admin_notifications
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Target admin (null = broadcast to all admins)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="admin_notifications",
        limit_choices_to={"is_staff": True},
        help_text=_("If null, this is a broadcast notification to all staff."),
    )

    title             = models.CharField(max_length=255)
    body              = models.TextField()
    notification_type = models.CharField(max_length=50, blank=True, db_index=True)
    priority          = models.CharField(
        max_length=20,
        choices=NotificationPriority.choices,
        default=NotificationPriority.NORMAL,
        db_index=True,
    )
    data    = models.JSONField(default=dict, blank=True,
                                help_text=_("Arbitrary contextual data payload."))
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admin_notifications"
        verbose_name = _("Admin Notification")
        verbose_name_plural = _("Admin Notifications")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_read", "recipient"],
                         name="idx_notif_unread"),
            models.Index(fields=["priority"],
                         name="idx_notif_priority"),
        ]

    def mark_read(self):
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=["is_read", "read_at"])

    def __str__(self):
        return f"[{self.priority.upper()}] {self.title}"


# ══════════════════════════════════════════════════════════════════════════════
# DAILY STATISTIC  (maps to TABLE: daily_statistics)
# ══════════════════════════════════════════════════════════════════════════════

class DailyStatistic(models.Model):
    """
    Pre-aggregated platform metrics cached per day.
    Used to power the Admin Dashboard charts without expensive live queries.

    Populated by: management command `python manage.py aggregate_stats`
    or a Celery periodic task running at midnight IST.

    Table name: daily_statistics
    """

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date            = models.DateField(unique=True, db_index=True,
                                        verbose_name=_("Statistics Date"))
    total_bookings  = models.PositiveIntegerField(default=0)
    completed_bookings = models.PositiveIntegerField(default=0)
    cancelled_bookings = models.PositiveIntegerField(default=0)

    # CRITICAL: DecimalField for ALL monetary aggregates
    total_revenue   = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_payouts   = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    platform_earnings = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    new_users       = models.PositiveIntegerField(default=0)
    new_workers     = models.PositiveIntegerField(default=0)
    active_workers  = models.PositiveIntegerField(default=0)

    metadata        = models.JSONField(default=dict, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "daily_statistics"
        verbose_name = _("Daily Statistic")
        verbose_name_plural = _("Daily Statistics")
        ordering = ["-date"]

    def __str__(self):
        return f"Stats {self.date}: {self.total_bookings} bookings, ₹{self.total_revenue}"
