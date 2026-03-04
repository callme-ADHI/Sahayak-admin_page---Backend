"""
moderation/models.py
====================
Trust & Safety Layer — Keeps the platform fair and accountable.

Tables defined here:
  - reports         → User-submitted abuse/bug/scam tickets
  - banned_entities → Registry of banned users/workers/IPs
  - admin_actions   → Admin intervention records
  - audit_logs      → Immutable system-wide event log

ARCHITECTURAL DECISIONS:
  ▸ audit_logs is APPEND-ONLY — no update, no delete, no soft delete
  ▸ banned_entities stores entity_type as string, not FK, for flexibility
    (can ban a user, worker, device, or IP address)
  ▸ admin_actions links to User (is_staff) — not a separate ADMINS table
  ▸ All moderation actions are timestamped for legal compliance
"""

import uuid
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


# ══════════════════════════════════════════════════════════════════════════════
# REPORT  (maps to TABLE: reports)
# ══════════════════════════════════════════════════════════════════════════════

class ReportType(models.TextChoices):
    ABUSE     = "abuse",     _("Abuse / Harassment")
    SCAM      = "scam",      _("Scam / Fraud")
    BUG       = "bug",       _("Bug / Technical Issue")
    FAKE      = "fake",      _("Fake Profile")
    SPAM      = "spam",      _("Spam")
    OTHER     = "other",     _("Other")


class ReportStatus(models.TextChoices):
    OPEN      = "open",      _("Open")
    IN_REVIEW = "in_review", _("Under Review")
    RESOLVED  = "resolved",  _("Resolved")
    DISMISSED = "dismissed", _("Dismissed")


class Report(models.Model):
    """
    General moderation ticket submitted by any platform user.
    Links to the reporting user and optionally to a specific entity.

    Table name: reports
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reports",
        db_column="reporter_id",
    )
    # What they reported (user, worker, job, etc.)
    target_entity_type = models.CharField(max_length=50, blank=True,
                                           help_text=_("e.g. 'user', 'worker', 'job'"))
    target_entity_id   = models.UUIDField(null=True, blank=True)

    report_type = models.CharField(
        max_length=20,
        choices=ReportType.choices,
        db_index=True,
    )
    description = models.TextField()
    status      = models.CharField(
        max_length=20,
        choices=ReportStatus.choices,
        default=ReportStatus.OPEN,
        db_index=True,
    )
    admin_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_reports",
        limit_choices_to={"is_staff": True},
    )
    resolved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reports"
        verbose_name = _("Report")
        verbose_name_plural = _("Reports")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"],      name="idx_reports_status"),
            models.Index(fields=["report_type"], name="idx_reports_type"),
            models.Index(fields=["reporter"],    name="idx_reports_reporter"),
        ]

    def __str__(self):
        return f"Report [{self.report_type}] [{self.status}]"


# ══════════════════════════════════════════════════════════════════════════════
# BANNED ENTITY  (maps to TABLE: banned_entities)
# ══════════════════════════════════════════════════════════════════════════════

class EntityType(models.TextChoices):
    USER   = "user",   _("User")
    WORKER = "worker", _("Worker")
    IP     = "ip",     _("IP Address")
    DEVICE = "device", _("Device")


class BannedEntity(models.Model):
    """
    Registry of platform bans.
    Stores entity_type as a string (not FK) to support banning
    diverse entity types (users, IPs, devices, workers).

    Table name: banned_entities
    """

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity_id   = models.UUIDField(db_index=True,
                                    verbose_name=_("Entity UUID"),
                                    help_text=_("ID of the banned entity."))
    entity_type = models.CharField(max_length=20, choices=EntityType.choices,
                                    db_index=True)
    reason      = models.TextField(verbose_name=_("Ban Reason"))
    is_active   = models.BooleanField(default=True, db_index=True,
                                       verbose_name=_("Is Currently Banned"))

    banned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="issued_bans",
        limit_choices_to={"is_staff": True},
    )
    expires_at  = models.DateTimeField(null=True, blank=True,
                                        help_text=_("If null, ban is permanent."))

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "banned_entities"
        verbose_name = _("Banned Entity")
        verbose_name_plural = _("Banned Entities")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["entity_id", "entity_type"],
                         name="idx_ban_entity"),
            models.Index(fields=["is_active"],
                         name="idx_ban_active"),
        ]

    def __str__(self):
        return f"Ban [{self.entity_type}:{self.entity_id}] active={self.is_active}"


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN ACTION  (maps to TABLE: admin_actions)
# ══════════════════════════════════════════════════════════════════════════════

class AdminAction(models.Model):
    """
    Records deliberate admin interventions (ban, verify, respond to report).
    Separate from audit_logs for targeted admin workflow tracking.

    Table name: admin_actions
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        db_column="admin_action_id",   # Matches original schema
    )
    admin_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="admin_actions",
        db_column="admin_user_id",
        limit_choices_to={"is_staff": True},
    )
    action_type        = models.CharField(max_length=50, db_index=True)
    target_entity_type = models.CharField(max_length=50, blank=True)
    target_entity_id   = models.UUIDField(null=True, blank=True)
    description        = models.TextField(blank=True)
    metadata           = models.JSONField(default=dict, blank=True)
    created_at         = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admin_actions"
        verbose_name = _("Admin Action")
        verbose_name_plural = _("Admin Actions")
        ordering = ["-created_at"]

    def __str__(self):
        return f"AdminAction [{self.action_type}] by {self.admin_user_id}"


# ══════════════════════════════════════════════════════════════════════════════
# AUDIT LOG  (maps to TABLE: audit_logs)
# ══════════════════════════════════════════════════════════════════════════════

class AuditLog(models.Model):
    """
    Immutable system-wide event log for security and compliance.
    NEVER edited or deleted — append-only.

    Django's save() and delete() should be overridden to prevent mutation.
    Only created_at timestamp — no updated_at (records cannot change).

    Table name: audit_logs
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Staff/superuser who triggered the action
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
        db_column="admin_id",
        limit_choices_to={"is_staff": True},
    )
    action_type  = models.CharField(max_length=50, db_index=True,
                                     help_text=_("create, update, delete, login, logout, ban"))
    target_type  = models.CharField(max_length=50, blank=True, db_index=True,
                                     help_text=_("entity type: user, job, worker, system"))
    target_id    = models.UUIDField(null=True, blank=True,
                                     help_text=_("ID of the affected entity"))
    description  = models.TextField(blank=True)
    ip_address   = models.GenericIPAddressField(null=True, blank=True)
    user_agent   = models.TextField(blank=True)

    # Before/after snapshot for change tracking
    before_data  = models.JSONField(null=True, blank=True)
    after_data   = models.JSONField(null=True, blank=True)

    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "audit_logs"
        verbose_name = _("Audit Log")
        verbose_name_plural = _("Audit Logs")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["action_type"],  name="idx_al_action"),
            models.Index(fields=["target_type"],  name="idx_al_target"),
            models.Index(fields=["created_at"],   name="idx_al_date"),
        ]

    def save(self, *args, **kwargs):
        """Enforce append-only: prevent updates to existing audit entries."""
        if self.pk and AuditLog.objects.filter(pk=self.pk).exists():
            raise PermissionError("Audit logs are immutable and cannot be modified.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Hard deletes of audit logs are forbidden."""
        raise PermissionError("Audit logs cannot be deleted.")

    def __str__(self):
        return f"AuditLog [{self.action_type}] on {self.target_type} at {self.created_at}"
