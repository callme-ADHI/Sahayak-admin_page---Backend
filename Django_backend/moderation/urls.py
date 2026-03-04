"""
moderation/urls.py
Auto-generated URL routing for moderation API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()


router.register(r'reports', ReportViewSet)
router.register(r'banned_entities', BannedEntityViewSet)
router.register(r'admin_actions', AdminActionViewSet)
router.register(r'audit_logs', AuditLogViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
