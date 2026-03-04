"""
accounts/models.py
==================
Identity & Access Layer — The foundation of all authentication.

Tables defined here:
  - users             → Custom AbstractBaseUser (replaces Supabase auth schema)
  - user_profiles     → Extended personal details (OneToOne → users)
  - roles             → Business-level roles catalog
  - user_roles        → M2M bridge: users ↔ roles
  - worker_profiles   → Service-provider extended profile (OneToOne → users)
  - verification_requests → KYC document queue

ARCHITECTURAL DECISIONS:
  ▸ UUID primary keys on all tables (consistent with original schema & frontend)
  ▸ No ADMINS table — replaced by Django is_staff / is_superuser / Groups
  ▸ wallet_balance removed from users → lives in finance.Wallet (normalized)
  ▸ All float money fields → DecimalField(max_digits=12, decimal_places=2)
  ▸ Soft delete via is_deleted on users & worker_profiles
  ▸ Timestamps (created_at / updated_at) on every table
  ▸ DB-level indexes on phone, email, worker_status for query performance
"""

import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


# ══════════════════════════════════════════════════════════════════════════════
# MANAGER
# ══════════════════════════════════════════════════════════════════════════════

class UserManager(BaseUserManager):
    """
    Custom manager that allows login via PHONE or EMAIL.
    Phone is the primary credential; email is optional.
    """

    def _create_user(self, phone, password, **extra_fields):
        if not phone:
            raise ValueError(_("Phone number is required."))
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)   # Django hashes via PBKDF2
        user.save(using=self._db)
        return user

    def create_user(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(phone, password, **extra_fields)

    def create_superuser(self, phone, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if not extra_fields.get("is_staff"):
            raise ValueError(_("Superuser must have is_staff=True."))
        if not extra_fields.get("is_superuser"):
            raise ValueError(_("Superuser must have is_superuser=True."))
        return self._create_user(phone, password, **extra_fields)


# ══════════════════════════════════════════════════════════════════════════════
# USER  (maps to TABLE: users)
# ══════════════════════════════════════════════════════════════════════════════

class AccountStatus(models.TextChoices):
    ACTIVE    = "active",    _("Active")
    SUSPENDED = "suspended", _("Suspended")
    BANNED    = "banned",    _("Banned")


class User(AbstractBaseUser, PermissionsMixin):
    """
    Central identity entity for ALL platform participants.
    Replaces the original Supabase `users` table + manual password_hash.

    Table name : users  (matches original schema — no rename needed)
    Primary Key: UUID   (matches original schema)
    Login field: phone  (phone is required; email is optional)
    """

    # ── Primary Key ───────────────────────────────────────────────────────────
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        db_column="id",          # Explicitly matches original schema column name
    )

    # ── Core Credentials ──────────────────────────────────────────────────────
    phone = models.CharField(
        max_length=15,
        unique=True,
        db_index=True,
        verbose_name=_("Phone Number"),
        help_text=_("Used as the primary login credential."),
    )
    email = models.EmailField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        verbose_name=_("Email Address"),
    )
    # NOTE: password is inherited from AbstractBaseUser (hashed via Django)

    # ── Status Flags ──────────────────────────────────────────────────────────
    account_status = models.CharField(
        max_length=20,
        choices=AccountStatus.choices,
        default=AccountStatus.ACTIVE,
        db_index=True,
        verbose_name=_("Account Status"),
    )
    is_verified = models.BooleanField(
        default=False,
        verbose_name=_("KYC Verified"),
        help_text=_("Whether the user's identity documents are verified."),
    )

    # ── Django Auth Flags (replaces ADMINS table) ─────────────────────────────
    is_active    = models.BooleanField(default=True)   # Required by AbstractBaseUser
    is_staff     = models.BooleanField(default=False)  # Can access Django admin
    is_superuser = models.BooleanField(default=False)  # Has all permissions

    # ── Soft Delete ───────────────────────────────────────────────────────────
    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name=_("Soft Deleted"),
        help_text=_("Marks a user as deleted without removing the record."),
    )
    deleted_at = models.DateTimeField(null=True, blank=True)

    # ── Timestamps ────────────────────────────────────────────────────────────
    date_joined = models.DateTimeField(
        default=timezone.now,
        verbose_name=_("Date Joined"),
        db_column="created_at",   # Keeps original column name in DB
    )
    updated_at = models.DateTimeField(auto_now=True)

    # ── Manager ───────────────────────────────────────────────────────────────
    objects = UserManager()

    USERNAME_FIELD  = "phone"    # Field used for authentication
    REQUIRED_FIELDS = []         # Only phone + password required for createsuperuser

    class Meta:
        db_table = "users"
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["phone"],          name="idx_users_phone"),
            models.Index(fields=["email"],          name="idx_users_email"),
            models.Index(fields=["account_status"], name="idx_users_status"),
            models.Index(fields=["is_deleted"],     name="idx_users_deleted"),
        ]

    def __str__(self):
        return f"{self.phone} ({self.account_status})"

    def soft_delete(self):
        """Soft-delete: never hard-removes a user from the DB."""
        self.is_deleted  = True
        self.is_active   = False
        self.deleted_at  = timezone.now()
        self.save(update_fields=["is_deleted", "is_active", "deleted_at"])


# ══════════════════════════════════════════════════════════════════════════════
# USER PROFILE  (maps to TABLE: user_profiles)
# ══════════════════════════════════════════════════════════════════════════════

class GenderChoice(models.TextChoices):
    MALE   = "male",   _("Male")
    FEMALE = "female", _("Female")
    OTHER  = "other",  _("Other")


class UserProfile(models.Model):
    """
    Extended personal attributes for a User.
    OneToOne with User — created automatically on user registration.

    Table name: user_profiles
    """

    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="profile",
        db_column="user_id",
    )
    full_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Full Name"),
    )
    gender = models.CharField(
        max_length=10,
        choices=GenderChoice.choices,
        blank=True,
        null=True,
    )
    profile_photo_url = models.ImageField(
        upload_to="profiles/",
        null=True,
        blank=True,
        verbose_name=_("Profile Photo"),
    )
    date_of_birth = models.DateField(null=True, blank=True)
    language_preference = models.CharField(max_length=10, default="en")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_profiles"
        verbose_name = _("User Profile")
        verbose_name_plural = _("User Profiles")

    def __str__(self):
        return f"Profile – {self.full_name or self.user.phone}"


# ══════════════════════════════════════════════════════════════════════════════
# ROLES  (maps to TABLE: roles)
# ══════════════════════════════════════════════════════════════════════════════

class Role(models.Model):
    """
    Business-level roles catalog.
    Examples: 'customer', 'worker', 'support_agent'.

    NOTE: These are BUSINESS roles, not Django permission roles.
          Django Groups handle system-level permissions separately.

    Table name: roles
    """

    # Integer PK matches original schema (role_id → id after migration)
    role_name   = models.CharField(max_length=50, unique=True, verbose_name=_("Role Name"))
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "roles"
        verbose_name = _("Role")
        verbose_name_plural = _("Roles")
        ordering = ["role_name"]

    def __str__(self):
        return self.role_name


# ══════════════════════════════════════════════════════════════════════════════
# USER ROLES  (maps to TABLE: user_roles)
# ══════════════════════════════════════════════════════════════════════════════

class UserRole(models.Model):
    """
    M2M bridge between User ↔ Role.
    A user can have multiple business roles (e.g., both 'customer' and 'worker').

    Table name: user_roles
    """

    user      = models.ForeignKey("accounts.User", on_delete=models.CASCADE,
                                  related_name="user_roles", db_column="user_id")
    role      = models.ForeignKey(Role, on_delete=models.PROTECT,
                                  related_name="user_roles", db_column="role_id")
    is_active = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "user_roles"
        unique_together = [("user", "role")]
        verbose_name = _("User Role")
        verbose_name_plural = _("User Roles")
        indexes = [
            models.Index(fields=["user", "is_active"], name="idx_user_roles_active"),
        ]

    def __str__(self):
        return f"{self.user.phone} → {self.role.role_name}"


# ══════════════════════════════════════════════════════════════════════════════
# WORKER PROFILE  (maps to TABLE: worker_profiles)
# ══════════════════════════════════════════════════════════════════════════════

class WorkerStatus(models.TextChoices):
    ACTIVE    = "active",    _("Active")
    OFFLINE   = "offline",   _("Offline")
    BANNED    = "banned",    _("Banned")
    SUSPENDED = "suspended", _("Suspended")
    PENDING   = "pending",   _("Pending Approval")


class WorkerProfile(models.Model):
    """
    Extended attributes for platform service providers.
    OneToOne with User — created when a user registers as a worker.

    Table name: worker_profiles
    """

    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="worker_profile",
        db_column="user_id",
    )
    worker_status = models.CharField(
        max_length=20,
        choices=WorkerStatus.choices,
        default=WorkerStatus.PENDING,
        db_index=True,
        verbose_name=_("Worker Status"),
    )
    government_id_type   = models.CharField(max_length=30, blank=True)
    government_id_number = models.CharField(max_length=30, unique=True, null=True, blank=True)
    experience_years     = models.PositiveSmallIntegerField(default=0)
    bio                  = models.TextField(blank=True)

    # Decimal replaces Float for accuracy
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        verbose_name=_("Average Rating"),
    )
    total_jobs_completed = models.PositiveIntegerField(default=0)
    is_available         = models.BooleanField(default=True, db_index=True)

    # Soft delete
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "worker_profiles"
        verbose_name = _("Worker Profile")
        verbose_name_plural = _("Worker Profiles")
        indexes = [
            models.Index(fields=["worker_status"], name="idx_wp_status"),
            models.Index(fields=["is_available"],  name="idx_wp_available"),
        ]

    def __str__(self):
        return f"Worker – {self.user.phone} [{self.worker_status}]"

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at"])


# ══════════════════════════════════════════════════════════════════════════════
# VERIFICATION REQUEST  (maps to TABLE: verification_requests)
# ══════════════════════════════════════════════════════════════════════════════

class VerificationStatus(models.TextChoices):
    PENDING  = "pending",  _("Pending Review")
    APPROVED = "approved", _("Approved")
    REJECTED = "rejected", _("Rejected")


class VerificationRequest(models.Model):
    """
    KYC document submission queue for worker verification.
    Admins review these and approve/reject them.

    Table name: verification_requests
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    worker = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name="verification_requests",
        db_column="worker_id",
    )
    request_type = models.CharField(
        max_length=50,
        default="initial_verification",
        verbose_name=_("Request Type"),
    )
    status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
        db_index=True,
    )
    # Documents stored as a JSON list of { type, url } objects
    documents_submitted = models.JSONField(
        default=list,
        verbose_name=_("Submitted Documents"),
        help_text=_("List of document objects: [{type, url}]"),
    )

    # Reviewed by a staff user (is_staff=True)
    reviewed_by  = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_requests",
        db_column="reviewed_by",
        limit_choices_to={"is_staff": True},
    )
    reviewed_at      = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    admin_notes      = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "verification_requests"
        verbose_name = _("Verification Request")
        verbose_name_plural = _("Verification Requests")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"],    name="idx_vr_status"),
            models.Index(fields=["worker_id"], name="idx_vr_worker"),
        ]

    def __str__(self):
        return f"VerReq [{self.status}] – {self.worker_id}"
