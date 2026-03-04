"""
accounts/urls.py
Auto-generated URL routing for accounts API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()


router.register(r'users',                 UserViewSet,                basename='users')
router.register(r'user_profiles',          UserProfileViewSet,         basename='user-profiles')
router.register(r'roles',                  RoleViewSet,                basename='roles')
router.register(r'user_roles',             UserRoleViewSet,            basename='user-roles')
router.register(r'worker_profiles',        WorkerProfileViewSet,       basename='worker-profiles')
router.register(r'verification_requests',  VerificationRequestViewSet, basename='verification-requests')

urlpatterns = [
    path("", include(router.urls)),
]
