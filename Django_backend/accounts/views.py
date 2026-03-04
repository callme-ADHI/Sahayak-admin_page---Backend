"""
accounts/views.py
=================
Production ViewSets for the accounts app.

KEY DECISIONS:
  - Soft-deleted records are excluded from all querysets by default.
  - UserViewSet supports filtering by account_status AND 'status' alias.
  - WorkerProfileViewSet supports filtering by worker_status AND 'status' alias.
  - Custom actions: /users/{id}/suspend/, /users/{id}/ban/, /users/{id}/activate/
  - Search on phone, email, profile name.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import User, UserProfile, Role, UserRole, WorkerProfile, VerificationRequest
from .serializers import (
    UserSerializer, UserWriteSerializer, UserProfileSerializer, RoleSerializer,
    UserRoleSerializer, WorkerProfileSerializer, VerificationRequestSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    """
    GET  /api/v1/accounts/users/                    → list all non-deleted users
    GET  /api/v1/accounts/users/?account_status=active
    GET  /api/v1/accounts/users/?is_staff=true      → admins only
    POST /api/v1/accounts/users/{id}/suspend/
    POST /api/v1/accounts/users/{id}/ban/
    POST /api/v1/accounts/users/{id}/activate/
    """
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['account_status', 'is_staff', 'is_verified', 'is_active', 'is_deleted']
    search_fields      = ['phone', 'email', 'profile__full_name']
    ordering_fields    = ['date_joined', 'updated_at', 'phone']
    ordering           = ['-date_joined']

    def get_queryset(self):
        # Exclude soft-deleted by default
        qs = User.objects.filter(is_deleted=False).select_related('profile')
        # Allow ?status=active as alias for account_status
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(account_status=status_param)
        return qs

    def get_serializer_class(self):
        if self.action in ('update', 'partial_update'):
            return UserWriteSerializer
        return UserSerializer

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        user = self.get_object()
        user.account_status = 'suspended'
        user.is_active = False
        user.save(update_fields=['account_status', 'is_active'])
        return Response({'status': 'suspended'})

    @action(detail=True, methods=['post'])
    def ban(self, request, pk=None):
        user = self.get_object()
        user.account_status = 'banned'
        user.is_active = False
        user.save(update_fields=['account_status', 'is_active'])
        return Response({'status': 'banned'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.account_status = 'active'
        user.is_active = True
        user.save(update_fields=['account_status', 'is_active'])
        return Response({'status': 'active'})


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset           = UserProfile.objects.all()
    serializer_class   = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter]
    search_fields      = ['full_name']


class RoleViewSet(viewsets.ModelViewSet):
    queryset           = Role.objects.all()
    serializer_class   = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]


class UserRoleViewSet(viewsets.ModelViewSet):
    queryset           = UserRole.objects.filter(is_active=True).select_related('role')
    serializer_class   = UserRoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['user', 'role', 'is_active']


class WorkerProfileViewSet(viewsets.ModelViewSet):
    """
    GET  /api/v1/accounts/worker_profiles/
    GET  /api/v1/accounts/worker_profiles/?worker_status=pending  (pending verifications)
    GET  /api/v1/accounts/worker_profiles/?status=active          (alias)
    POST /api/v1/accounts/worker_profiles/{id}/approve/
    POST /api/v1/accounts/worker_profiles/{id}/reject/
    POST /api/v1/accounts/worker_profiles/{id}/suspend/
    POST /api/v1/accounts/worker_profiles/{id}/ban/
    """
    serializer_class   = WorkerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['worker_status', 'is_available', 'is_deleted']
    search_fields      = ['user__phone', 'user__email', 'user__profile__full_name', 'government_id_number']
    ordering_fields    = ['created_at', 'average_rating', 'total_jobs_completed']
    ordering           = ['-created_at']

    def get_queryset(self):
        qs = WorkerProfile.objects.filter(is_deleted=False).select_related('user', 'user__profile')
        # Allow ?status=pending as alias for worker_status
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(worker_status=status_param)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        worker = self.get_object()
        worker.worker_status = 'active'
        worker.user.is_verified = True
        worker.user.save(update_fields=['is_verified'])
        worker.save(update_fields=['worker_status'])
        return Response({'status': 'active', 'is_verified': True})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reason = request.data.get('reason', '')
        worker = self.get_object()
        worker.worker_status = 'suspended'
        worker.save(update_fields=['worker_status'])
        # Also update latest pending VerificationRequest
        VerificationRequest.objects.filter(
            worker=worker, status='pending'
        ).update(status='rejected', rejection_reason=reason)
        return Response({'status': 'suspended'})

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        worker = self.get_object()
        worker.worker_status = 'suspended'
        worker.save(update_fields=['worker_status'])
        return Response({'status': 'suspended'})

    @action(detail=True, methods=['post'])
    def ban(self, request, pk=None):
        worker = self.get_object()
        worker.worker_status = 'banned'
        worker.save(update_fields=['worker_status'])
        return Response({'status': 'banned'})


class VerificationRequestViewSet(viewsets.ModelViewSet):
    serializer_class   = VerificationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['status', 'request_type']
    ordering           = ['-created_at']

    def get_queryset(self):
        return VerificationRequest.objects.select_related(
            'worker', 'worker__user', 'worker__user__profile', 'reviewed_by'
        ).all()
