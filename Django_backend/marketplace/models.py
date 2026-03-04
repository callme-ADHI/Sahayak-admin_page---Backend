"""
marketplace/models.py
=====================
Service Delivery Layer — The core of the Job Karo marketplace.

Tables defined here:
  - categories          → Service catalog (Cleaning, Plumbing, etc.)
  - addresses           → User delivery locations
  - jobs                → Service requests created by customers
  - job_assignments     → Worker acceptance of a job
  - job_status_history  → Immutable log of job state transitions
  - worker_categories   → M2M bridge: worker_profiles ↔ categories

ARCHITECTURAL DECISIONS:
  ▸ Job status is an enum — prevents invalid states at DB level
  ▸ final_price → DecimalField (never Float for money)
  ▸ job_assignments uses ForeignKey(job) not OneToOne → scale-ready
  ▸ job_status_history provides full observability into job lifecycle
  ▸ Soft delete on jobs (legal audit trail for dispute resolution)
  ▸ Latitude/longitude → DecimalField (9 digits, 6 decimal places)
  ▸ Composite DB indexes for common query patterns
"""

import uuid
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator


# ══════════════════════════════════════════════════════════════════════════════
# CATEGORY  (maps to TABLE: categories)
# ══════════════════════════════════════════════════════════════════════════════

class Category(models.Model):
    """
    Service category catalog (renamed from `skills` in original schema).
    All available services a worker can offer.

    Table name: categories
    """

    name        = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True)
    icon        = models.CharField(max_length=255, blank=True, verbose_name=_("Icon Identifier"))
    base_rate   = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Base Rate (INR)"),
    )
    is_active    = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveSmallIntegerField(default=0)

    # Soft delete
    is_deleted = models.BooleanField(default=False, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "categories"
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ["display_order", "name"]
        indexes = [
            models.Index(fields=["is_active", "is_deleted"], name="idx_cat_active"),
            models.Index(fields=["name"],                    name="idx_cat_name"),
        ]

    def __str__(self):
        return self.name


# ══════════════════════════════════════════════════════════════════════════════
# WORKER CATEGORY  (maps to TABLE: worker_categories)
# ══════════════════════════════════════════════════════════════════════════════

class WorkerCategory(models.Model):
    """
    Bridges a WorkerProfile to the Categories they can perform.
    A worker can offer multiple services at custom rates.

    Table name: worker_categories
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    worker = models.ForeignKey(
        "accounts.WorkerProfile",
        on_delete=models.CASCADE,
        related_name="worker_categories",
        db_column="worker_id",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,   # Don't delete category if workers use it
        related_name="worker_categories",
        db_column="category_id",
    )
    is_primary    = models.BooleanField(default=False)
    rate_override = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Custom Rate Override (INR)"),
    )
    years_experience = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "worker_categories"
        verbose_name = _("Worker Category")
        verbose_name_plural = _("Worker Categories")
        # UniqueConstraint: one row per (worker, category) pair
        constraints = [
            models.UniqueConstraint(
                fields=["worker", "category"],
                name="uniq_worker_category",
            )
        ]
        indexes = [
            models.Index(fields=["worker", "category"], name="idx_wc_composite"),
        ]

    def __str__(self):
        return f"{self.worker_id} → {self.category.name}"


# ══════════════════════════════════════════════════════════════════════════════
# ADDRESS  (maps to TABLE: addresses)
# ══════════════════════════════════════════════════════════════════════════════

class Address(models.Model):
    """
    Physical delivery/service location owned by a User.

    Table name: addresses
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False,
                          db_column="address_id")

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="addresses",
        db_column="user_id",
    )
    label        = models.CharField(max_length=50, blank=True,
                                    help_text=_("e.g. Home, Office"))
    address_line = models.TextField(verbose_name=_("Full Address"))
    landmark     = models.CharField(max_length=255, blank=True)
    city         = models.CharField(max_length=100, db_index=True)
    state        = models.CharField(max_length=100)
    pincode      = models.CharField(max_length=10)

    # Decimal lat/lng — more accurate than Float
    latitude  = models.DecimalField(max_digits=9, decimal_places=6,
                                    null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6,
                                    null=True, blank=True)
    is_default = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "addresses"
        verbose_name = _("Address")
        verbose_name_plural = _("Addresses")
        indexes = [
            models.Index(fields=["user", "is_default"], name="idx_addr_user_default"),
            models.Index(fields=["city"],                name="idx_addr_city"),
        ]

    def __str__(self):
        return f"{self.address_line}, {self.city}"


# ══════════════════════════════════════════════════════════════════════════════
# JOB  (maps to TABLE: jobs)
# ══════════════════════════════════════════════════════════════════════════════

class JobStatus(models.TextChoices):
    PENDING     = "pending",     _("Pending")
    ACCEPTED    = "accepted",    _("Accepted")
    IN_PROGRESS = "in_progress", _("In Progress")
    COMPLETED   = "completed",   _("Completed")
    CANCELLED   = "cancelled",   _("Cancelled")
    DISPUTED    = "disputed",    _("Disputed")


class Job(models.Model):
    """
    The core service-request entity. Created by a customer, fulfilled by a worker.
    Keeps original column name `job_id` as primary key (matched to frontend).

    Table name: jobs
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        db_column="job_id",   # Original schema column name preserved
    )

    # Customer who placed the booking
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,   # Never delete customer that has active job
        related_name="jobs",
        db_column="user_id",
    )
    # Service category requested
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="jobs",
        db_column="skill_id",       # Original column name preserved
    )
    # Delivery location
    address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="jobs",
        db_column="address_id",
    )

    job_status = models.CharField(
        max_length=30,
        choices=JobStatus.choices,
        default=JobStatus.PENDING,
        db_index=True,
        verbose_name=_("Job Status"),
    )

    # CRITICAL: DecimalField — never Float for monetary values
    final_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_("Final Price (INR)"),
    )

    description        = models.TextField(blank=True)
    scheduled_at       = models.DateTimeField(null=True, blank=True, db_index=True)
    cancellation_reason = models.TextField(blank=True)

    # Soft delete
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "jobs"
        verbose_name = _("Job")
        verbose_name_plural = _("Jobs")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["job_status", "scheduled_at"],
                         name="idx_jobs_status_date"),
            models.Index(fields=["user", "job_status"],
                         name="idx_jobs_user_status"),
            models.Index(fields=["is_deleted"],
                         name="idx_jobs_deleted"),
        ]

    def __str__(self):
        return f"Job {self.id} [{self.job_status}]"

    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at"])


# ══════════════════════════════════════════════════════════════════════════════
# JOB ASSIGNMENT  (maps to TABLE: job_assignments)
# ══════════════════════════════════════════════════════════════════════════════

class AssignmentStatus(models.TextChoices):
    ASSIGNED  = "assigned",  _("Assigned")
    ACCEPTED  = "accepted",  _("Accepted")
    REJECTED  = "rejected",  _("Rejected")
    STARTED   = "started",   _("Started")
    COMPLETED = "completed", _("Completed")
    CANCELLED = "cancelled", _("Cancelled")


class JobAssignment(models.Model):
    """
    Tracks which worker accepted a job and their execution timeline.

    Design Note:
      Uses ForeignKey(job) — not OneToOneField — to allow re-assignment
      if a worker backs out (scalable for marketplace dynamics).
      job_id is retained as original column name for schema compatibility.

    Table name: job_assignments
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="assignments",
        db_column="job_id",
    )
    worker = models.ForeignKey(
        "accounts.WorkerProfile",
        on_delete=models.PROTECT,
        related_name="assignments",
        db_column="worker_id",
    )
    assignment_status = models.CharField(
        max_length=30,
        choices=AssignmentStatus.choices,
        default=AssignmentStatus.ASSIGNED,
        db_index=True,
    )

    # Execution timeline
    accepted_at   = models.DateTimeField(null=True, blank=True)
    started_at    = models.DateTimeField(null=True, blank=True)
    completed_at  = models.DateTimeField(null=True, blank=True)
    cancelled_at  = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "job_assignments"
        verbose_name = _("Job Assignment")
        verbose_name_plural = _("Job Assignments")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["job", "assignment_status"],
                         name="idx_ja_job_status"),
            models.Index(fields=["worker", "assignment_status"],
                         name="idx_ja_worker_status"),
        ]

    def __str__(self):
        return f"Assignment: Job {self.job_id} → Worker {self.worker_id}"


# ══════════════════════════════════════════════════════════════════════════════
# JOB STATUS HISTORY  (maps to TABLE: job_status_history)
# ══════════════════════════════════════════════════════════════════════════════

class JobStatusHistory(models.Model):
    """
    Immutable audit trail of every job state transition.
    Never edited or soft-deleted — append-only table.

    Table name: job_status_history
    """

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="status_history",
        db_column="job_id",
    )
    old_status = models.CharField(max_length=30, choices=JobStatus.choices)
    new_status = models.CharField(max_length=30, choices=JobStatus.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="changed_by",
    )
    reason     = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "job_status_history"
        verbose_name = _("Job Status History")
        verbose_name_plural = _("Job Status Histories")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["job"], name="idx_jsh_job"),
        ]

    def __str__(self):
        return f"Job {self.job_id}: {self.old_status} → {self.new_status}"
