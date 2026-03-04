"""
moderation/urls.py — Corrected URL routing for moderation API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, BannedEntityViewSet, AdminActionViewSet, AuditLogViewSet

router = DefaultRouter()
router.register(r'reports',         ReportViewSet,       basename='reports')
router.register(r'banned_entities', BannedEntityViewSet, basename='banned-entities')
router.register(r'admin_actions',   AdminActionViewSet,  basename='admin-actions')
router.register(r'audit_logs',      AuditLogViewSet,     basename='audit-logs')

urlpatterns = [
    path('', include(router.urls)),
]
