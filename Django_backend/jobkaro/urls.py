"""
jobkaro/urls.py
===============
Root URL Configuration for Job Karo Django Backend.

URL structure:
  /admin/                 → Django admin panel
  /api/v1/auth/           → JWT auth endpoints (token obtain/refresh/verify)
  /api/v1/accounts/       → User, profile, worker endpoints
  /api/v1/marketplace/    → Categories, jobs, assignments
  /api/v1/finance/        → Wallets, transactions, disputes
  /api/v1/moderation/     → Reports, bans, audit logs
  /api/v1/core/           → System settings, notifications, statistics
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# ── Admin Site Branding ────────────────────────────────────────────────────
admin.site.site_header  = "Job Karo Admin"
admin.site.site_title   = "Job Karo"
admin.site.index_title  = "Platform Administration"

urlpatterns = [
    # ── Django Admin Panel ──────────────────────────────────────────────────
    path("admin/", admin.site.urls),

    # ── JWT Authentication ──────────────────────────────────────────────────
    path("api/v1/auth/token/",         TokenObtainPairView.as_view(),
         name="token_obtain_pair"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(),
         name="token_refresh"),
    path("api/v1/auth/token/verify/",  TokenVerifyView.as_view(),
         name="token_verify"),

    # ── App API Routes (to be implemented per app) ──────────────────────────
    path("api/v1/accounts/",    include("accounts.urls")),
    path("api/v1/marketplace/", include("marketplace.urls")),
    path("api/v1/finance/",     include("finance.urls")),
    path("api/v1/moderation/",  include("moderation.urls")),
    path("api/v1/core/",        include("core.urls")),
]

# ── Serve Media Files in Development ──────────────────────────────────────
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
