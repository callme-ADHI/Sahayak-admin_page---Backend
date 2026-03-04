"""
finance/urls.py — Corrected URL routing for finance API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WalletViewSet, TransactionViewSet, PlatformCommissionViewSet,
    PaymentDisputeViewSet, RatingViewSet,
)

router = DefaultRouter()
router.register(r'wallets',              WalletViewSet)
router.register(r'transactions',         TransactionViewSet,          basename='transactions')
router.register(r'platform_commissions', PlatformCommissionViewSet)
router.register(r'payment_disputes',     PaymentDisputeViewSet,       basename='payment-disputes')
router.register(r'ratings',              RatingViewSet,               basename='ratings')

urlpatterns = [
    path('', include(router.urls)),
]
