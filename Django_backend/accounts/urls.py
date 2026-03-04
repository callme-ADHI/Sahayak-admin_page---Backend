"""
accounts/urls.py
Auto-generated URL routing for accounts API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()


router.register(r'users', UserViewSet)
router.register(r'user_profiles', UserProfileViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'user_roles', UserRoleViewSet)
router.register(r'worker_profiles', WorkerProfileViewSet)
router.register(r'verification_requests', VerificationRequestViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
