"""
core/urls.py — Corrected URL routing for core API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SystemSettingViewSet, AdminNotificationViewSet, DailyStatisticViewSet

router = DefaultRouter()
router.register(r'system_settings',      SystemSettingViewSet)
router.register(r'admin_notifications',  AdminNotificationViewSet, basename='admin_notifications')
router.register(r'daily_statistics',     DailyStatisticViewSet,    basename='daily-statistics')

urlpatterns = [
    path('', include(router.urls)),
]
