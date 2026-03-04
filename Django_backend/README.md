# Job Karo — Django Backend

> **Production-grade Django 6.0 backend for the Job Karo marketplace platform.**
> Replaces the Supabase schema while preserving all original table names and column names.

---

## Stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Framework      | Django 6.0.3                            |
| API            | Django REST Framework 3.16              |
| Authentication | JWT (djangorestframework-simplejwt 5.5) |
| Database       | PostgreSQL (production) / SQLite (dev)  |
| ORM            | Django ORM                              |
| Password Hash  | PBKDF2 + SHA256 (Django built-in)       |
| CORS           | django-cors-headers                     |
| Environment    | django-environ                          |

---

## Project Structure

```
Django_backend/
├── jobkaro/                 ← Django project config
│   ├── settings.py          ← All settings (12 sections, documented)
│   ├── urls.py              ← Root URL config + JWT endpoints
│   └── wsgi.py
│
├── accounts/                ← Identity & Access
│   ├── models.py            ← User, UserProfile, Role, UserRole,
│   │                           WorkerProfile, VerificationRequest
│   ├── backends.py          ← Phone OR Email login backend
│   └── admin.py
│
├── marketplace/             ← Service Delivery
│   ├── models.py            ← Category, WorkerCategory, Address,
│   │                           Job, JobAssignment, JobStatusHistory
│   └── admin.py
│
├── finance/                 ← Money & Payments
│   ├── models.py            ← Wallet, Transaction, PlatformCommission,
│   │                           PaymentDispute, Rating
│   └── admin.py
│
├── moderation/              ← Trust & Safety
│   ├── models.py            ← Report, BannedEntity, AdminAction, AuditLog
│   └── admin.py
│
├── core/                    ← System Infrastructure
│   ├── models.py            ← SystemSetting, AdminNotification, DailyStatistic
│   ├── exceptions.py        ← Global DRF exception handler
│   └── admin.py
│
├── docs/                    ← Full documentation
│   ├── tables_details.txt   ← Complete column-level documentation
│   └── schema.mermaid       ← Full ER diagram (Mermaid syntax)
│
├── requirements.txt
├── .env.example             ← Template — copy to .env
├── .env                     ← Local config (NOT committed to git)
└── manage.py
```

---

## Quick Start

```bash
# 1. Enter the project
cd Django_backend

# 2. Activate virtual environment
source venv/bin/activate

# 3. Copy and configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Apply migrations
python manage.py migrate

# 5. Create admin user
python manage.py createsuperuser

# 6. Run dev server
python manage.py runserver
```

Access Django Admin: `http://127.0.0.1:8000/admin/`

---

## API Endpoints

| Method | URL                            | Description              |
|--------|--------------------------------|--------------------------|
| POST   | `/api/v1/auth/token/`          | Login → get JWT tokens   |
| POST   | `/api/v1/auth/token/refresh/`  | Refresh access token     |
| POST   | `/api/v1/auth/token/verify/`   | Verify token validity    |

App-level endpoints (in progress):
- `/api/v1/accounts/`
- `/api/v1/marketplace/`
- `/api/v1/finance/`
- `/api/v1/moderation/`
- `/api/v1/core/`

---

## Key Architecture Decisions

### 1. Custom User Model (`accounts.User`)
- **Phone-first login** — `USERNAME_FIELD = 'phone'`
- Email is optional fallback
- Django handles all password hashing (PBKDF2)
- `is_staff` / `is_superuser` replace the old `admins` table
- Soft-delete via `is_deleted` flag (never hard-delete users)

### 2. All Money Fields → `DecimalField`
- Every monetary value uses `DecimalField(max_digits=12, decimal_places=2)`
- **Float is explicitly forbidden** for any financial data
- Affects: `final_price`, `amount`, `commission_amount`, `rate_override`, `current_balance`, `total_revenue`

### 3. Wallet Normalized
- `wallet_balance` removed from `users` table
- Lives in a dedicated `wallets` table as `OneToOneField(User)`
- All balance updates **must** use `select_for_update()` inside `atomic()`

### 4. Immutable Audit Logs
- `AuditLog.save()` raises `PermissionError` if record already exists
- `AuditLog.delete()` always raises `PermissionError`
- Django Admin for audit logs has `has_change_permission = False`

### 5. DB Column Names Preserved
All `db_column` parameters are set to match the original Supabase schema:
- `job_id` column name preserved on `Job` model
- `skill_id` preserved as FK column to categories
- `transaction_id`, `rating_id`, `address_id` all preserved

---

## Switching to PostgreSQL

Update `.env`:
```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=jobkaro
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

Then: `python manage.py migrate`

---

## Security Checklist (Production)

Before deploying to production, update `.env`:
```env
DEBUG=False
SECRET_KEY=<long-random-50+-char-key>
ALLOWED_HOSTS=yourdomain.com
```

And add to `settings.py`:
```python
SECURE_HSTS_SECONDS = 31536000
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```
