"""
finance/urls.py
Auto-generated URL routing for finance API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()


router.register(r'wallets', WalletViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'platform_commissions', PlatformCommissionViewSet)
router.register(r'payment_disputes', PaymentDisputeViewSet)
router.register(r'ratings', RatingViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
