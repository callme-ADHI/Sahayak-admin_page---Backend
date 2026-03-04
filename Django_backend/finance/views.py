"""
finance/views.py
================
Production ViewSets for the finance app.
"""

from rest_framework import viewsets, permissions, status as http_status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import Wallet, Transaction, PlatformCommission, PaymentDispute, Rating
from .serializers import (
    WalletSerializer, TransactionSerializer, PlatformCommissionSerializer,
    PaymentDisputeSerializer, RatingSerializer,
)


class WalletViewSet(viewsets.ModelViewSet):
    queryset           = Wallet.objects.select_related('user').all()
    serializer_class   = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['is_frozen', 'currency']


class TransactionViewSet(viewsets.ModelViewSet):
    """
    GET  /api/v1/finance/transactions/
    GET  /api/v1/finance/transactions/?transaction_status=success
    GET  /api/v1/finance/transactions/?status=failed   ← alias
    """
    serializer_class   = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields   = ['transaction_status', 'transaction_type', 'job']
    ordering_fields    = ['created_at', 'amount']
    ordering           = ['-created_at']
    search_fields      = ['from_user__phone', 'to_user__phone', 'gateway_reference']

    def get_queryset(self):
        qs = Transaction.objects.select_related('from_user', 'to_user', 'job').all()
        # ?status=X alias
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(transaction_status=status_param)
        return qs


class PlatformCommissionViewSet(viewsets.ModelViewSet):
    queryset           = PlatformCommission.objects.all()
    serializer_class   = PlatformCommissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['is_settled']


class PaymentDisputeViewSet(viewsets.ModelViewSet):
    """
    GET  /api/v1/finance/payment_disputes/
    POST /api/v1/finance/payment_disputes/{id}/resolve/
    """
    serializer_class   = PaymentDisputeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['status', 'dispute_type', 'raised_by_type']
    ordering           = ['-created_at']

    def get_queryset(self):
        return PaymentDispute.objects.select_related('raised_by', 'job').all()

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        dispute = self.get_object()
        dispute.status      = 'resolved'
        dispute.resolved_by = request.user
        dispute.resolution  = request.data.get('resolution', '')
        from django.utils import timezone
        dispute.resolved_at = timezone.now()
        dispute.save(update_fields=['status', 'resolved_by', 'resolution', 'resolved_at'])
        return Response({'status': 'resolved'})


class RatingViewSet(viewsets.ModelViewSet):
    serializer_class   = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['job', 'from_user', 'to_user', 'rating_type']
    ordering           = ['-created_at']

    def get_queryset(self):
        return Rating.objects.select_related('from_user', 'to_user', 'job').all()
