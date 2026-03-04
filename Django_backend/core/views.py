"""
core/views.py
=============
Production ViewSets for the core app.
"""

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.utils import timezone

from .models import SystemSetting, AdminNotification, DailyStatistic
from .serializers import (
    SystemSettingSerializer, AdminNotificationSerializer, DailyStatisticSerializer,
)


class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset           = SystemSetting.objects.all()
    serializer_class   = SystemSettingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['category', 'is_public', 'is_editable']
    lookup_field       = 'key'    # Use the text key as URL param, not integer id


class AdminNotificationViewSet(viewsets.ModelViewSet):
    """
    GET  /api/v1/core/admin_notifications/
    POST /api/v1/core/admin_notifications/{id}/mark_read/
    POST /api/v1/core/admin_notifications/mark_all_read/
    """
    serializer_class   = AdminNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['is_read', 'priority', 'recipient']
    ordering           = ['-created_at']

    def get_queryset(self):
        # Show notifications for current user OR broadcasts (recipient=None)
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return AdminNotification.objects.filter(
                recipient=user
            ) | AdminNotification.objects.filter(recipient__isnull=True)
        return AdminNotification.objects.none()

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.read_at = timezone.now()
        notif.save(update_fields=['is_read', 'read_at'])
        return Response({'is_read': True})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        AdminNotification.objects.filter(
            recipient=request.user, is_read=False
        ).update(is_read=True, read_at=timezone.now())
        return Response({'marked': 'all read'})


class DailyStatisticViewSet(viewsets.ModelViewSet):
    serializer_class   = DailyStatisticSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['date']
    ordering           = ['-date']

    def get_queryset(self):
        qs = DailyStatistic.objects.all()
        # Support ?days=30 query param
        days = self.request.query_params.get('days')
        if days:
            from datetime import timedelta, date
            since = date.today() - timedelta(days=int(days))
            qs = qs.filter(date__gte=since)
        return qs
