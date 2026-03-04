"""
finance/models.py
=================
Financial Layer — The money engine of Job Karo.

Tables defined here:
  - wallets              → Normalized per-user balance (OneToOne → User)
  - transactions         → Full payment ledger
  - platform_commissions → Platform take per job
  - payment_disputes     → Financial conflict management
  - ratings              → Star ratings & reviews

ARCHITECTURAL DECISIONS:
  ▸ ALL monetary fields use DecimalField(max_digits=12, decimal_places=2)
    → Float NEVER allowed near money; binary rounding causes drift.
  ▸ Wallet is separated from User (no wallet_balance on users table)
    → Single source of truth; prevents balance duplication bugs.
  ▸ Transactions use on_delete=PROTECT for job → no orphan records
  ▸ select_for_update() must be used when updating wallet balances
    (enforced in service layer, not model layer)
  ▸ CheckConstraints enforce business rules at DB level
"""

import uuid
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


# ══════════════════════════════════════════════════════════════════════════════
# WALLET  (maps to TABLE: wallets)
# ══════════════════════════════════════════════════════════════════════════════

class Wallet(models.Model):
    """
    One wallet per user. Holds platform credit/escrow balance.
    Normalized out of the User model to prevent duplication.

    CONCURRENCY WARNING:
      All balance updates MUST use:
        Wallet.objects.select_for_update().get(user=user)
      inside an atomic transaction to prevent race conditions.

    Table name: wallets
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="wallet",
        db_column="user_id",
    )
    current_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        verbose_name=_("Current Balance (INR)"),
    )
    currency        = models.CharField(max_length=5, default="INR")
    is_frozen       = models.BooleanField(
        default=False,
        help_text=_("Frozen wallets cannot send or receive funds."),
    )
    last_updated_at = models.DateTimeField(auto_now=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "wallets"
        verbose_name = _("Wallet")
        verbose_name_plural = _("Wallets")

    def __str__(self):
        return f"Wallet({self.user_id}) ₹{self.current_balance}"


# ══════════════════════════════════════════════════════════════════════════════
# TRANSACTION  (maps to TABLE: transactions)
# ══════════════════════════════════════════════════════════════════════════════

class TransactionType(models.TextChoices):
    PAYMENT  = "payment",  _("Payment")
    REFUND   = "refund",   _("Refund")
    PAYOUT   = "payout",   _("Worker Payout")
    TOP_UP   = "top_up",   _("Wallet Top-Up")
    REVERSAL = "reversal", _("Reversal")


class TransactionStatus(models.TextChoices):
    PENDING = "pending", _("Pending")
    SUCCESS = "success", _("Success")
    FAILED  = "failed",  _("Failed")
    REVERSED = "reversed", _("Reversed")


class Transaction(models.Model):
    """
    Double-entry style ledger of all platform financial movements.
    Every money movement creates one record here.

    Primary key uses original schema name `transaction_id` column.

    Table name: transactions
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        db_column="transaction_id",   # Matches original schema
    )

    job = models.ForeignKey(
        "marketplace.Job",
        on_delete=models.PROTECT,     # Financial records MUST NOT cascade-delete
        related_name="transactions",
        null=True,
        blank=True,
        db_column="job_id",
    )

    # from_user_id → sender (customer paying, or platform refunding)
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="sent_transactions",
        null=True,
        blank=True,
        db_column="from_user_id",
    )
    # to_user_id → receiver (worker getting paid, or user getting refund)
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="received_transactions",
        null=True,
        blank=True,
        db_column="to_user_id",
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
        default=TransactionType.PAYMENT,
        db_index=True,
    )

    # CRITICAL: DecimalField — never Float
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Amount (INR)"),
    )
    currency = models.CharField(max_length=5, default="INR")

    transaction_status = models.CharField(
        max_length=20,
        choices=TransactionStatus.choices,
        default=TransactionStatus.PENDING,
        db_index=True,
    )

    payment_method    = models.CharField(max_length=30, blank=True,
                                         help_text=_("upi, card, wallet, netbanking"))
    gateway_reference = models.CharField(max_length=255, blank=True,
                                         verbose_name=_("Payment Gateway Ref ID"))
    failure_reason    = models.TextField(blank=True)
    metadata          = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "transactions"
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["transaction_status"], name="idx_txn_status"),
            models.Index(fields=["job"],                name="idx_txn_job"),
            models.Index(fields=["from_user"],          name="idx_txn_from"),
            models.Index(fields=["to_user"],            name="idx_txn_to"),
        ]

    def __str__(self):
        return f"TXN {self.id} ₹{self.amount} [{self.transaction_status}]"


# ══════════════════════════════════════════════════════════════════════════════
# PLATFORM COMMISSION  (maps to TABLE: platform_commissions)
# ══════════════════════════════════════════════════════════════════════════════

class PlatformCommission(models.Model):
    """
    Tracks the platform's earnings per completed job.

    Table name: platform_commissions
    """

    job = models.OneToOneField(
        "marketplace.Job",
        on_delete=models.PROTECT,
        primary_key=True,
        related_name="commission",
        db_column="job_id",
    )
    commission_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name=_("Commission %"),
    )
    commission_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_("Commission Amount (INR)"),
    )
    is_settled = models.BooleanField(default=False)
    settled_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "platform_commissions"
        verbose_name = _("Platform Commission")
        verbose_name_plural = _("Platform Commissions")
        # CheckConstraint: commission must be 0–100%
        constraints = [
            models.CheckConstraint(
                condition=models.Q(commission_percentage__gte=0,
                                   commission_percentage__lte=100),
                name="chk_commission_pct_range",
            )
        ]

    def __str__(self):
        return f"Commission: Job {self.job_id} – {self.commission_percentage}%"


# ══════════════════════════════════════════════════════════════════════════════
# PAYMENT DISPUTE  (maps to TABLE: payment_disputes)
# ══════════════════════════════════════════════════════════════════════════════

class DisputeStatus(models.TextChoices):
    OPEN       = "open",       _("Open")
    IN_REVIEW  = "in_review",  _("Under Review")
    RESOLVED   = "resolved",   _("Resolved")
    DISMISSED  = "dismissed",  _("Dismissed")


class PaymentDispute(models.Model):
    """
    Financial disagreements between customers and workers.
    Admin reviews and resolves; may trigger refund transactions.

    Table name: payment_disputes
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    job = models.ForeignKey(
        "marketplace.Job",
        on_delete=models.PROTECT,
        related_name="disputes",
        db_column="booking_id",      # Matches frontend's 'booking_id' expectation
    )
    raised_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="raised_disputes",
        db_column="raised_by",
    )
    raised_by_type  = models.CharField(max_length=20,
                                        help_text=_("'customer' or 'worker'"))
    dispute_type    = models.CharField(max_length=50, blank=True)
    amount_disputed = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    description   = models.TextField(blank=True)
    evidence_urls = models.JSONField(default=list, blank=True)

    status     = models.CharField(max_length=20, choices=DisputeStatus.choices,
                                   default=DisputeStatus.OPEN, db_index=True)
    resolution = models.TextField(blank=True)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2,
                                         null=True, blank=True)

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_disputes",
        limit_choices_to={"is_staff": True},
    )
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_disputes",
    )
    resolved_at  = models.DateTimeField(null=True, blank=True)
    admin_notes  = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payment_disputes"
        verbose_name = _("Payment Dispute")
        verbose_name_plural = _("Payment Disputes")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"],   name="idx_disputes_status"),
            models.Index(fields=["job"],      name="idx_disputes_job"),
        ]

    def __str__(self):
        return f"Dispute {self.id} [{self.status}]"


# ══════════════════════════════════════════════════════════════════════════════
# RATING  (maps to TABLE: ratings)
# ══════════════════════════════════════════════════════════════════════════════

class Rating(models.Model):
    """
    Star ratings and text reviews submitted after job completion.
    Bidirectional: customer ↔ worker can both review.

    Table name: ratings
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        db_column="rating_id",   # Matches original schema
    )
    job = models.ForeignKey(
        "marketplace.Job",
        on_delete=models.CASCADE,
        related_name="ratings",
        db_column="job_id",
    )
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="given_ratings",
        db_column="from_user_id",
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_ratings",
        db_column="to_user_id",
    )
    rating_value = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_("Star Rating"),
    )
    review_text = models.TextField(blank=True)
    rating_type = models.CharField(
        max_length=20,
        default="job_review",
        help_text=_("Type of review: 'job_review' or 'worker_review'"),
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ratings"
        verbose_name = _("Rating")
        verbose_name_plural = _("Ratings")
        unique_together = [("job", "from_user", "rating_type")]
        ordering = ["-created_at"]
        constraints = [
            # Enforce 1–5 at DB level
            models.CheckConstraint(
                condition=models.Q(rating_value__gte=1, rating_value__lte=5),
                name="chk_rating_value_range",
            )
        ]

    def __str__(self):
        return f"Rating {self.rating_value}★ – Job {self.job_id}"
