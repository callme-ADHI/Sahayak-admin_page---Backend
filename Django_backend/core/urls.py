"""
core/urls.py
Auto-generated URL routing for core API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()


router.register(r'system_settings', SystemSettingViewSet)
router.register(r'admin_notifications', AdminNotificationViewSet)
router.register(r'daily_statistics', DailyStatisticViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
