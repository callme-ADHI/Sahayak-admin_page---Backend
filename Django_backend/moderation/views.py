"""
moderation/views.py
====================
Production ViewSets for moderation app.
AuditLog is read-only (append-only design).
"""

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Report, BannedEntity, AdminAction, AuditLog
from .serializers import (
    ReportSerializer, BannedEntitySerializer,
    AdminActionSerializer, AuditLogSerializer,
)


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class   = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'report_type', 'reporter']
    search_fields      = ['description', 'reporter__phone']
    ordering           = ['-created_at']

    def get_queryset(self):
        return Report.objects.select_related('reporter', 'resolved_by').all()


class BannedEntityViewSet(viewsets.ModelViewSet):
    serializer_class   = BannedEntitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['entity_type', 'is_active', 'banned_by']
    ordering           = ['-created_at']

    def get_queryset(self):
        return BannedEntity.objects.select_related('banned_by').all()

    @action(detail=True, methods=['post'])
    def lift(self, request, pk=None):
        """Lift an active ban."""
        ban = self.get_object()
        ban.is_active = False
        ban.save(update_fields=['is_active'])
        return Response({'is_active': False})


class AdminActionViewSet(viewsets.ModelViewSet):
    serializer_class   = AdminActionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['action_type', 'admin_user']
    ordering           = ['-created_at']

    def get_queryset(self):
        return AdminAction.objects.select_related('admin_user', 'admin_user__profile').all()


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    AuditLog is append-only — no create/update/delete via API.
    Admin panel creates logs internally via the service layer.
    """
    serializer_class   = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['action_type', 'target_type', 'admin']
    search_fields      = ['description', 'admin__phone', 'action_type']
    ordering           = ['-created_at']

    def get_queryset(self):
        return AuditLog.objects.select_related('admin', 'admin__profile').all()
