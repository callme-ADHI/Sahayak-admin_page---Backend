"""
marketplace/views.py
====================
Production ViewSets for marketplace app.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Category, WorkerCategory, Address, Job, JobAssignment, JobStatusHistory
from .serializers import (
    CategorySerializer, WorkerCategorySerializer, AddressSerializer,
    JobSerializer, JobAssignmentSerializer, JobStatusHistorySerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class   = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['is_active', 'is_deleted']
    search_fields      = ['name', 'description']
    ordering_fields    = ['display_order', 'name', 'created_at']
    ordering           = ['display_order', 'name']

    def get_queryset(self):
        return Category.objects.filter(is_deleted=False)


class WorkerCategoryViewSet(viewsets.ModelViewSet):
    queryset           = WorkerCategory.objects.select_related('category').all()
    serializer_class   = WorkerCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['worker', 'category', 'is_primary']


class AddressViewSet(viewsets.ModelViewSet):
    queryset           = Address.objects.all()
    serializer_class   = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter]
    filterset_fields   = ['user', 'city', 'is_default']
    search_fields      = ['city', 'state', 'pincode', 'address_line']


class JobViewSet(viewsets.ModelViewSet):
    """
    GET  /api/v1/marketplace/jobs/
    GET  /api/v1/marketplace/jobs/?job_status=pending
    GET  /api/v1/marketplace/jobs/?booking_status=pending   ← alias
    POST /api/v1/marketplace/jobs/{id}/update_status/
    """
    serializer_class   = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['job_status', 'user', 'category', 'is_deleted']
    search_fields      = ['description', 'user__phone', 'category__name']
    ordering_fields    = ['created_at', 'scheduled_at', 'final_price']
    ordering           = ['-created_at']

    def get_queryset(self):
        qs = Job.objects.filter(is_deleted=False).select_related(
            'user', 'user__profile', 'category', 'address'
        )
        # Support ?booking_status=X as alias for job_status
        booking_status = self.request.query_params.get('booking_status')
        if booking_status:
            qs = qs.filter(job_status=booking_status)
        return qs

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        job = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed'):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = job.job_status
        job.job_status = new_status
        job.save(update_fields=['job_status', 'updated_at'])

        # Log the status change
        JobStatusHistory.objects.create(
            job=job,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user,
            reason=request.data.get('reason', ''),
        )
        return Response({'status': new_status})


class JobAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class   = JobAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['job', 'worker', 'assignment_status']
    ordering           = ['-created_at']

    def get_queryset(self):
        return JobAssignment.objects.select_related(
            'worker', 'worker__user', 'worker__user__profile'
        ).all()


class JobStatusHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only — history is append-only."""
    serializer_class   = JobStatusHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['job']
    ordering           = ['-created_at']

    def get_queryset(self):
        return JobStatusHistory.objects.select_related('changed_by').all()
