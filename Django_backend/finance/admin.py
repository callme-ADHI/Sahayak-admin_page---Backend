"""
finance/admin.py — Django Admin for finance models.
"""

from django.contrib import admin
from .models import Wallet, Transaction, PlatformCommission, PaymentDispute, Rating


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display  = ("user", "current_balance", "currency", "is_frozen", "last_updated_at")
    list_filter   = ("is_frozen", "currency")
    search_fields = ("user__phone",)
    readonly_fields = ("last_updated_at", "created_at")


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display  = ("id", "transaction_type", "amount",
                      "transaction_status", "from_user", "to_user", "created_at")
    list_filter   = ("transaction_status", "transaction_type")
    search_fields = ("from_user__phone", "to_user__phone", "gateway_reference")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PlatformCommission)
class PlatformCommissionAdmin(admin.ModelAdmin):
    list_display  = ("job", "commission_percentage", "commission_amount", "is_settled")
    list_filter   = ("is_settled",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(PaymentDispute)
class PaymentDisputeAdmin(admin.ModelAdmin):
    list_display  = ("id", "job", "raised_by", "amount_disputed",
                      "status", "resolved_at")
    list_filter   = ("status",)
    search_fields = ("raised_by__phone",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display  = ("job", "from_user", "to_user", "rating_value", "rating_type")
    list_filter   = ("rating_value", "rating_type")
    search_fields = ("from_user__phone", "job__id")
    readonly_fields = ("created_at",)
