"""
marketplace/urls.py
Auto-generated URL routing for marketplace API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()


router.register(r'categories', CategoryViewSet)
router.register(r'worker_categories', WorkerCategoryViewSet)
router.register(r'address', AddressViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'job_assignments', JobAssignmentViewSet)
router.register(r'job_status_histories', JobStatusHistoryViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
