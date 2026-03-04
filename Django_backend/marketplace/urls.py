"""
marketplace/urls.py — Correct URL routing for marketplace API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, WorkerCategoryViewSet, AddressViewSet,
    JobViewSet, JobAssignmentViewSet, JobStatusHistoryViewSet,
)

router = DefaultRouter()
router.register(r'categories',          CategoryViewSet,          basename='categories')
router.register(r'worker_categories',   WorkerCategoryViewSet,    basename='worker-categories')
router.register(r'addresses',           AddressViewSet)
router.register(r'jobs',                JobViewSet,               basename='jobs')
router.register(r'job_assignments',     JobAssignmentViewSet,     basename='job-assignments')
router.register(r'job_status_history',  JobStatusHistoryViewSet,  basename='job-status-history')

urlpatterns = [
    path('', include(router.urls)),
]
