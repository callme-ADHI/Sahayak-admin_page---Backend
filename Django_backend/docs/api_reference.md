# JobKaro — Django REST API Reference

**Version:** 2.0.0  
**Base URL (dev):** `http://127.0.0.1:8000/api/v1`  
**Auth:** JWT Bearer token — all endpoints require `Authorization: Bearer <access_token>`  
**Pagination:** All list responses: `{ "count": N, "next": url|null, "previous": url|null, "results": [...] }`

---

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/token/` | Login — returns `access` + `refresh` JWT tokens |
| POST | `/auth/token/refresh/` | Renew access token with refresh token |
| POST | `/auth/token/verify/` | Check if a token is still valid |

### Login Request
```json
POST /api/v1/auth/token/
{ "phone": "+919999999999", "password": "your_password" }
```
### Login Response
```json
{ "access": "eyJ...", "refresh": "eyJ..." }
```

---

## accounts — Identity & Access

### Users `/api/v1/accounts/users/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts/users/` | List all non-deleted users |
| GET | `/accounts/users/{id}/` | Get single user |
| PATCH | `/accounts/users/{id}/` | Update user fields |
| POST | `/accounts/users/{id}/suspend/` | Set account_status → suspended |
| POST | `/accounts/users/{id}/ban/` | Set account_status → banned |
| POST | `/accounts/users/{id}/activate/` | Set account_status → active |

**Filter params:** `?account_status=active|suspended|banned` _(also `?status=` alias)_  
**Search:** `?search=phone_or_email_or_name`  
**Order:** `?ordering=-date_joined`

**Response fields:**
```json
{
  "id": "uuid", "phone": "+91...", "email": "...",
  "status": "active",            // alias for account_status
  "account_status": "active",
  "name": "Full Name",           // from UserProfile.full_name
  "is_verified": false,
  "is_active": true, "is_staff": false, "is_superuser": false,
  "is_deleted": false, "deleted_at": null,
  "date_joined": "ISO8601", "updated_at": "ISO8601", "last_login": null
}
```

### Worker Profiles `/api/v1/accounts/worker_profiles/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts/worker_profiles/` | List all non-deleted worker profiles |
| GET | `/accounts/worker_profiles/?worker_status=pending` | Pending verifications |
| GET | `/accounts/worker_profiles/{id}/` | Get single worker profile |
| POST | `/accounts/worker_profiles/{id}/approve/` | Approve worker (sets status → active) |
| POST | `/accounts/worker_profiles/{id}/reject/` | Reject worker — body: `{ "reason": "..." }` |
| POST | `/accounts/worker_profiles/{id}/suspend/` | Suspend worker |
| POST | `/accounts/worker_profiles/{id}/ban/` | Ban worker |

**Filter params:** `?worker_status=active|pending|suspended|banned` _(also `?status=` alias)_  
**Search:** `?search=phone_or_name`

**Response fields:**
```json
{
  "user_id": "uuid",           // PK
  "phone": "+91...",           // from User
  "email": "...",              // from User
  "name": "Full Name",         // from UserProfile.full_name
  "status": "active",          // alias for worker_status
  "worker_status": "active",
  "verification_status": "active",
  "government_id_type": "aadhar",
  "government_id_number": "XXXX",
  "experience_years": 3,
  "bio": "...",
  "average_rating": "4.50",
  "total_jobs_completed": 12,
  "is_available": true,
  "created_at": "ISO8601", "updated_at": "ISO8601"
}
```

### Verification Requests `/api/v1/accounts/verification_requests/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts/verification_requests/` | List all verification requests |
| GET | `/accounts/verification_requests/?status=pending` | Pending only |
| GET | `/accounts/verification_requests/?worker={uuid}` | For a specific worker |
| PATCH | `/accounts/verification_requests/{id}/` | Update status/admin_notes |

### Other Accounts Endpoints

| Endpoint | Description |
|----------|-------------|
| `/accounts/user_profiles/` | Extended user profile details |
| `/accounts/roles/` | Business role catalog |
| `/accounts/user_roles/` | User–role assignments |

---

## marketplace — Service Delivery

### Categories `/api/v1/marketplace/categories/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/marketplace/categories/` | List all active categories |
| POST | `/marketplace/categories/` | Create new category |
| PATCH | `/marketplace/categories/{id}/` | Update category |
| PATCH | `/marketplace/categories/{id}/` `{ "is_deleted": true }` | Soft-delete |

**Filter params:** `?is_active=true|false`  
**Order:** `?ordering=display_order`

### Jobs (Bookings) `/api/v1/marketplace/jobs/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/marketplace/jobs/` | List all non-deleted jobs |
| GET | `/marketplace/jobs/?job_status=pending` | Filter by status |
| GET | `/marketplace/jobs/?booking_status=cancelled` | Same — alias |
| GET | `/marketplace/jobs/{id}/` | Single job detail |
| POST | `/marketplace/jobs/{id}/update_status/` | Change status + log to history |

**Filter params:** `?job_status=pending|accepted|in_progress|completed|cancelled|disputed`  
`?booking_status=` _(alias for above)_  
**Order:** `?ordering=-created_at`

**update_status body:**
```json
{ "status": "completed", "reason": "optional note" }
```

**Response fields (key ones):**
```json
{
  "id": "uuid",
  "user": "uuid", "user_phone": "+91...", "user_name": "...",
  "category": 1, "category_name": "Cleaning",
  "address": "uuid", "address_label": "123 MG Road, Bangalore",
  "job_status": "pending",
  "booking_status": "pending",    // alias for job_status
  "final_price": "350.00",
  "scheduled_at": "ISO8601",
  "created_at": "ISO8601"
}
```

### Other Marketplace Endpoints

| Endpoint | Description |
|----------|-------------|
| `/marketplace/worker_categories/` | Worker–category skill mappings |
| `/marketplace/addresses/` | Customer delivery addresses |
| `/marketplace/job_assignments/` | Worker job assignments |
| `/marketplace/job_status_history/` | Read-only — status change log |

---

## finance — Payments & Money

### Transactions (Payments) `/api/v1/finance/transactions/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/finance/transactions/` | Full ledger |
| GET | `/finance/transactions/?transaction_status=failed` | Filter by status |
| GET | `/finance/transactions/?status=failed` | Alias |

**Response key fields:**
```json
{
  "id": "uuid",
  "job": "uuid|null", "from_user": "uuid", "to_user": "uuid",
  "from_user_phone": "+91...", "to_user_phone": "+91...",
  "transaction_type": "payment",
  "amount": "350.00", "currency": "INR",
  "status": "success",             // alias for transaction_status
  "transaction_status": "success",
  "payment_method": "upi",
  "created_at": "ISO8601"
}
```

### Payment Disputes `/api/v1/finance/payment_disputes/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/finance/payment_disputes/` | List all disputes |
| POST | `/finance/payment_disputes/{id}/resolve/` | Resolve — body: `{ "resolution": "..." }` |

### Other Finance Endpoints

| Endpoint | Description |
|----------|-------------|
| `/finance/wallets/` | User wallet balances |
| `/finance/platform_commissions/` | Per-job commission records |
| `/finance/ratings/` | Job ratings and reviews |

---

## moderation — Trust & Safety

### Reports `/api/v1/moderation/reports/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/moderation/reports/` | All reports |
| GET | `/moderation/reports/?status=open` | Open reports |
| PATCH | `/moderation/reports/{id}/` | Update status/admin_notes |

### Audit Logs `/api/v1/moderation/audit_logs/` (Read-only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/moderation/audit_logs/` | Full audit trail |
| GET | `/moderation/audit_logs/?action_type=ban` | Filter by action |
| GET | `/moderation/audit_logs/?search=phone` | Search by admin phone |

**Response key fields:**
```json
{
  "id": "uuid",
  "admin_name": "Admin Name",    // computed — was admins.name in Supabase
  "admin_phone": "+91...",       // from admin user
  "action_type": "ban",
  "target_type": "worker",
  "description": "Banned worker for...",
  "ip_address": "192.168.1.1",
  "created_at": "ISO8601"
}
```

### Other Moderation Endpoints

| Endpoint | Description |
|----------|-------------|
| `/moderation/banned_entities/` | Active bans list |
| `/moderation/banned_entities/{id}/lift/` | POST — lift a ban |
| `/moderation/admin_actions/` | Staff intervention records |

---

## core — System Infrastructure

### Admin Notifications `/api/v1/core/admin_notifications/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/core/admin_notifications/` | Current user's notifications |
| POST | `/core/admin_notifications/{id}/mark_read/` | Mark one as read |
| POST | `/core/admin_notifications/mark_all_read/` | Mark all as read |
| DELETE | `/core/admin_notifications/{id}/` | Delete a notification |

**Response key fields:**
```json
{
  "id": "uuid",
  "admin_id": "uuid",           // alias for recipient_id
  "title": "...", "body": "...",
  "priority": "normal",
  "is_read": false, "read_at": null,
  "created_at": "ISO8601"
}
```

### Daily Statistics `/api/v1/core/daily_statistics/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/core/daily_statistics/` | All time stats |
| GET | `/core/daily_statistics/?days=30` | Last 30 days |

**Response key fields:**
```json
{
  "date": "2026-03-04",
  "total_bookings": 45, "completed_bookings": 38, "cancelled_bookings": 7,
  "total_revenue": "18500.00",
  "total_payouts": "14800.00",
  "worker_earnings": "14800.00",   // alias for total_payouts
  "new_users": 12, "new_workers": 3, "active_workers": 67
}
```

### System Settings `/api/v1/core/system_settings/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/core/system_settings/` | All settings |
| PATCH | `/core/system_settings/{key}/` | Update by key name (not id) |

---

## Field Name Alias Map (Supabase → Django)

| Frontend expects | Django field | Notes |
|-----------------|--------------|-------|
| `status` | `account_status` | UserSerializer alias |
| `status` | `worker_status` | WorkerProfileSerializer alias |
| `booking_status` | `job_status` | JobSerializer alias |
| `status` | `transaction_status` | TransactionSerializer alias |
| `admin_id` | `recipient_id` | AdminNotificationSerializer alias |
| `worker_earnings` | `total_payouts` | DailyStatisticSerializer alias |
| `admin_name` | *(computed from admin.profile.full_name)* | AuditLogSerializer |
| `name` | *(computed from profile.full_name)* | UserSerializer + WorkerProfileSerializer |
| `phone` | *(from user.phone)* | WorkerProfileSerializer |
| `category_name` | *(from category.name)* | JobSerializer |
| `user_name` | *(from user.profile.full_name)* | JobSerializer |
| `reporter_phone` | *(from reporter.phone)* | ReportSerializer |
| `raised_by_phone` | *(from raised_by.phone)* | PaymentDisputeSerializer |

---

## Common Error Responses

```json
// 400 Bad Request
{ "status": "error", "detail": "...", "errors": { "field": ["msg"] } }

// 401 Unauthorized (token missing / expired)
{ "detail": "Given token not valid for any token type" }

// 403 Forbidden
{ "detail": "You do not have permission to perform this action." }

// 404 Not Found
{ "detail": "Not found." }
```
