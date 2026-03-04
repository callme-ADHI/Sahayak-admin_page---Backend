# JobKaro — Django Backend + React Admin

> **Production-grade Django 6.0 backend + React Admin dashboard — 100% connected, Supabase-free.**  
> All data flows through Django REST Framework endpoints secured with JWT.

---

## System Architecture

```
React Admin (Vite/TSX)                Django Backend (Python)
┌────────────────────────┐            ┌──────────────────────────────┐
│  src/api.ts            │   HTTP     │  jobkaro/urls.py             │
│  (Axios + JWT)         │ ─────────► │  /api/v1/accounts/           │
│                        │            │  /api/v1/marketplace/        │
│  services/             │   JSON     │  /api/v1/finance/            │
│  ├── users.ts          │ ◄───────── │  /api/v1/moderation/         │
│  ├── workers.ts        │            │  /api/v1/core/               │
│  ├── bookings.ts       │            │  /api/v1/auth/token/         │
│  ├── categories.ts     │            └──────────────────────────────┘
│  ├── analytics.ts      │                        │
│  └── admins.ts         │            ┌──────────────────────────────┐
│                        │            │  PostgreSQL Database          │
│  hooks/                │            │  24 tables across 5 apps     │
│  ├── useDashboardStats │            └──────────────────────────────┘
│  └── useAdminNotifs    │
└────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend Framework** | Django 6.0.3 |
| **REST API** | Django REST Framework 3.16 |
| **Authentication** | JWT — djangorestframework-simplejwt 5.5 |
| **Database (prod)** | PostgreSQL |
| **Database (dev)** | SQLite |
| **ORM** | Django ORM |
| **Filtering** | django-filter 25.2 |
| **CORS** | django-cors-headers |
| **Frontend** | React 18 + Vite + TypeScript |
| **HTTP Client** | Axios (JWT interceptor + auto refresh) |
| **State** | TanStack Query v5 |

---

## Project Structure

```
Sahayak-admin_page---Backend/
│
├── Admin/                           ← React Admin Dashboard (Vite/TSX)
│   ├── src/
│   │   ├── api.ts                   ← Axios client (JWT auth + auto refresh)
│   │   ├── services/
│   │   │   ├── users.ts             → /api/v1/accounts/users/
│   │   │   ├── workers.ts           → /api/v1/accounts/worker_profiles/
│   │   │   ├── bookings.ts          → /api/v1/marketplace/jobs/  +  /finance/transactions/
│   │   │   ├── categories.ts        → /api/v1/marketplace/categories/
│   │   │   ├── analytics.ts         → aggregated from multiple endpoints
│   │   │   └── admins.ts            → /api/v1/accounts/users/?is_staff=True
│   │   ├── hooks/
│   │   │   ├── useDashboardStats.ts → analytics.getDashboardStats()
│   │   │   ├── useAdminNotifications.ts → /api/v1/core/admin_notifications/
│   │   │   ├── useWorkers.ts        → workersService
│   │   │   ├── useUsers.ts          → usersService
│   │   │   ├── useBookings.ts       → bookingsService
│   │   │   └── useCategories.ts     → categoriesService
│   │   └── pages/
│   │       ├── auth/Login.tsx       ← Real JWT login (phone + password)
│   │       ├── AuditLogs.tsx        ← /moderation/audit_logs/
│   │       ├── BannedUsers.tsx      ← /accounts/users/ + /worker_profiles/ (suspended)
│   │       ├── WorkerApproval.tsx   ← /accounts/worker_profiles/?status=pending
│   │       └── works/
│   │           ├── WorkCategories.tsx  ← /marketplace/categories/
│   │           └── CancelledWorks.tsx  ← /marketplace/jobs/?booking_status=cancelled
│   └── .env                         ← VITE_DJANGO_API_URL only
│
└── Django_backend/                  ← Django REST API
    ├── accounts/                    ← Identity & Access (6 models)
    │   ├── models.py
    │   ├── serializers.py           ← Field aliases: status, name, phone
    │   ├── views.py                 ← Custom actions: suspend/ban/activate/approve/reject
    │   └── urls.py
    ├── marketplace/                 ← Service Delivery (6 models)
    │   ├── serializers.py           ← booking_status alias, nested user/category
    │   ├── views.py                 ← update_status action → logs to JobStatusHistory
    │   └── urls.py
    ├── finance/                     ← Money & Payments (5 models)
    │   ├── serializers.py           ← status alias for transaction_status
    │   └── urls.py
    ├── moderation/                  ← Trust & Safety (4 models)
    │   ├── serializers.py           ← admin_name computed field
    │   ├── views.py                 ← AuditLog: ReadOnlyModelViewSet
    │   └── urls.py
    ├── core/                        ← System Infrastructure (3 models)
    │   ├── serializers.py           ← admin_id alias, worker_earnings alias
    │   ├── views.py                 ← mark_read, mark_all_read actions
    │   └── urls.py
    ├── docs/
    │   ├── tables_details.txt       ← Complete column-level DB documentation
    │   ├── tables_reference.md      ← Tables, keys, relations summary
    │   ├── schema.mermaid           ← Full ER diagram
    │   └── api_reference.md         ← Full REST API endpoint reference (NEW)
    ├── .env                         ← Local config (gitignored)
    ├── .env.example                 ← Template
    └── requirements.txt
```

---

## Quick Start — Django Backend

```bash
cd Django_backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies  
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env (SQLite default works for dev — no DB setup needed)

# Run migrations
python manage.py migrate

# Create admin user (phone: +919999999999, password: adminpassword123)
python manage.py createsuperuser

# Start dev server
python manage.py runserver 8000
```

Django Admin UI: `http://127.0.0.1:8000/admin/`  
API Root: `http://127.0.0.1:8000/api/v1/`

---

## Quick Start — React Admin

```bash
cd Admin
npm install

# .env already configured — VITE_DJANGO_API_URL=http://127.0.0.1:8000/api/v1
npm run dev
```

Admin runs at: `http://localhost:5173/`  
**Login with Django superuser phone + password.** (Phone field, e.g. `+919999999999`)

---

## API Endpoints Overview

See **[docs/api_reference.md](./docs/api_reference.md)** for the complete reference.

| Prefix | Description |
|--------|-------------|
| `POST /api/v1/auth/token/` | Login → JWT access + refresh tokens |
| `POST /api/v1/auth/token/refresh/` | Renew access token |
| `GET /api/v1/accounts/users/` | Users list (filterable by status) |
| `GET /api/v1/accounts/worker_profiles/` | Worker profiles (filterable by status) |
| `GET /api/v1/marketplace/jobs/` | Jobs / bookings |
| `GET /api/v1/marketplace/categories/` | Service categories |
| `GET /api/v1/finance/transactions/` | Payment transactions |
| `GET /api/v1/finance/payment_disputes/` | Payment disputes |
| `GET /api/v1/moderation/reports/` | User reports |
| `GET /api/v1/moderation/audit_logs/` | Audit trail (read-only) |
| `GET /api/v1/core/admin_notifications/` | Admin bell notifications |
| `GET /api/v1/core/daily_statistics/` | Dashboard chart data |

---

## Key Architecture Decisions

### 1. Zero Supabase Dependency
- All frontend data fetching goes through `src/api.ts` (Axios → Django REST)
- `integrations/supabase/client.ts` is a dead stub that throws `SupabaseDeprecatedError` if called
- JWT stored in `localStorage` as `django_token: { access, refresh }`

### 2. Field Alias Layer
Serializers expose compatibility aliases so the frontend works without renaming every field:
- `account_status` → exposed as `status`
- `job_status` → exposed as `booking_status`
- `worker_status` → exposed as `status` + `verification_status`
- `total_payouts` → exposed as `worker_earnings`
- `recipient_id` → exposed as `admin_id`

### 3. Soft Delete by Default
All ViewSet querysets exclude `is_deleted=True` records. Deleted records are never shown in the API.

### 4. Custom Actions on Every Key Resource
```
POST /users/{id}/suspend|ban|activate/
POST /worker_profiles/{id}/approve|reject|suspend|ban/
POST /jobs/{id}/update_status/
POST /payment_disputes/{id}/resolve/
POST /admin_notifications/{id}/mark_read/
POST /admin_notifications/mark_all_read/
POST /banned_entities/{id}/lift/
```

### 5. Immutable Audit Logs
`AuditLog` model blocks `save()` and `delete()` on existing records at the Python level.  
API: `ReadOnlyModelViewSet` — no create/update/delete through REST.

### 6. All Money → `DecimalField`
Never `FloatField` for any financial data. Binary float rounding errors are unacceptable.

---

## Switching to PostgreSQL (Production)

Update `Django_backend/.env`:
```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=jobkaro
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
```
Then: `python manage.py migrate`

---

## Production Security Checklist

```env
# Django_backend/.env
DEBUG=False
SECRET_KEY=<random-50+-char-key>
ALLOWED_HOSTS=api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://admin.yourdomain.com
```

```python
# settings.py additions
SECURE_HSTS_SECONDS = 31536000
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```
