# Job Karo — Django Backend: Full Table Details

> **Authoritative, detailed documentation for every table in the Job Karo Django database.**
> Covers purpose, architecture decisions, column meanings, enum values, constraints, relationships, and migration notes.

---

## Overview

The Job Karo Django backend uses **24 database tables** spread across **5 Django apps**.
Every table was designed to:
- ✅ Preserve original Supabase column names (via `db_column`)
- ✅ Use `DecimalField` for all money (Float is forbidden)
- ✅ Carry `created_at` + `updated_at` on every transactional table
- ✅ Implement soft delete on users, workers, jobs, categories
- ✅ Enforce referential integrity with appropriate `on_delete` rules
- ✅ Include DB-level indexes on all hot query paths

---

## App 1: `accounts` — Identity & Access

The foundation of the platform. Manages all user identities, roles, and worker profiles.

---

### Table 1: `users`

**Django Model:** `accounts.User`
**Migration:** `accounts/migrations/0001_initial.py`

**Purpose:**
The central identity entity for every platform participant — customers, workers, and admins alike. Extends Django's `AbstractBaseUser` and `PermissionsMixin` to gain the full Django auth ecosystem while keeping the original schema structure.

This table **replaces**:
- The Supabase `users` table (with manual `password_hash`)
- The Supabase `admins` table (replaced by `is_staff`/`is_superuser` flags + Django Groups)

**Authentication Flow:**
Login via **phone** (primary) or **email** (fallback). Custom backend `accounts.backends.PhoneOrEmailBackend` handles this. Password is hashed by Django using PBKDF2+SHA256 — the raw password is never stored.

**Column Details:**

| Column | DB Column | Type | Nullable | Default | Description |
|---|---|---|---|---|---|
| `id` | `id` | UUID | No | `uuid4()` | Primary key. UUID matches original Supabase schema. |
| `phone` | `phone` | VARCHAR(15) | No | — | **Primary login credential.** UNIQUE. |
| `email` | `email` | VARCHAR(255) | Yes | NULL | Optional email login. UNIQUE when provided. |
| `password` | `password` | TEXT | No | — | PBKDF2 hash, managed by Django. Never plaintext. |
| `account_status` | `account_status` | VARCHAR(20) | No | `active` | Platform standing. Enum: `active`, `suspended`, `banned`. |
| `is_verified` | `is_verified` | BOOLEAN | No | `false` | True after KYC documents are approved. |
| `is_active` | `is_active` | BOOLEAN | No | `true` | Django auth flag. `false` = cannot log in. |
| `is_staff` | `is_staff` | BOOLEAN | No | `false` | Can access Django admin panel. **Replaces ADMINS table.** |
| `is_superuser` | `is_superuser` | BOOLEAN | No | `false` | Full unrestricted permissions. |
| `is_deleted` | `is_deleted` | BOOLEAN | No | `false` | Soft delete flag. Never hard-delete users. |
| `deleted_at` | `deleted_at` | TIMESTAMP | Yes | NULL | Populated when soft-deleted. |
| `date_joined` | `created_at` | TIMESTAMP | No | `NOW()` | Registration timestamp. DB column name preserved. |
| `updated_at` | `updated_at` | TIMESTAMP | No | AUTO | Auto-updated on every save. |
| `last_login` | `last_login` | TIMESTAMP | Yes | NULL | Updated by Django on successful login. |

**Enums:**
```
account_status: active | suspended | banned
```

**Indexes:**
- `idx_users_phone` → `phone` (primary login lookup)
- `idx_users_email` → `email` (fallback login)
- `idx_users_status` → `account_status` (admin filtering)
- `idx_users_deleted` → `is_deleted` (soft-delete filtering in queries)

**Key Methods:**
- `soft_delete()` — sets `is_deleted=True`, `is_active=False`, `deleted_at=NOW()`

---

### Table 2: `user_profiles`

**Django Model:** `accounts.UserProfile`

**Purpose:**
Extended personal details for a user. Separated from `users` to keep the auth model lean and fast. Created automatically when a user registers.

**Relationship:** OneToOne → `users.id` (CASCADE)

| Column | Type | Nullable | Description |
|---|---|---|---|
| `user_id` | UUID | No | **PK + FK** → `users.id`. CASCADE. |
| `full_name` | VARCHAR(255) | Yes | Display name. |
| `gender` | VARCHAR(10) | Yes | Enum: `male`, `female`, `other`. |
| `profile_photo_url` | TEXT | Yes | Stored at `MEDIA_ROOT/profiles/`. |
| `date_of_birth` | DATE | Yes | For age validation. |
| `language_preference` | VARCHAR(10) | No | Default: `en`. |
| `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | TIMESTAMP | No | Auto. |

---

### Table 3: `roles`

**Django Model:** `accounts.Role`

**Purpose:**
A catalog of **business-level roles** (e.g., `customer`, `worker`, `support_agent`).
These are NOT Django's security permission Groups — they represent product-level user classifications.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER (PK) | Auto-increment. |
| `role_name` | VARCHAR(50) | UNIQUE. e.g. `customer`, `worker`. |
| `description` | TEXT | Optional description. |
| `created_at` | TIMESTAMP | Auto. |

---

### Table 4: `user_roles`

**Django Model:** `accounts.UserRole`

**Purpose:**
M2M junction table. Links users to their business roles. A user can hold multiple roles simultaneously (e.g., same person is both customer and worker).

**Relationship:** M2M between `users` and `roles`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT (PK) | Auto. |
| `user_id` | UUID | FK → `users.id`, CASCADE. |
| `role_id` | INTEGER | FK → `roles.id`, PROTECT. |
| `is_active` | BOOLEAN | Default `true`. Allows deactivating a role without removing it. |
| `assigned_at` | TIMESTAMP | Auto. |

**Unique Together:** `(user_id, role_id)` — a user cannot be assigned the same role twice.
**Index:** `idx_user_roles_active` on `(user_id, is_active)`

---

### Table 5: `worker_profiles`

**Django Model:** `accounts.WorkerProfile`

**Purpose:**
Extended attributes for service providers. Only users who register as workers have a row here. Linked OneToOne to `users`.

**Relationship:** OneToOne → `users.id` (CASCADE)
**Soft Delete:** ✅ `is_deleted` + `deleted_at`

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `user_id` | UUID | No | — | **PK + FK** → `users.id`, CASCADE. |
| `worker_status` | VARCHAR(20) | No | `pending` | Platform standing. See enum below. |
| `government_id_type` | VARCHAR(30) | Yes | — | e.g. `aadhaar`, `pan`, `passport`. |
| `government_id_number` | VARCHAR(30) | Yes | NULL | UNIQUE. |
| `experience_years` | SMALLINT | No | `0` | Years of professional experience. |
| `bio` | TEXT | Yes | — | Free-text professional summary. |
| `average_rating` | DECIMAL(3,2) | No | `0.00` | Updated by trigger/service after review. |
| `total_jobs_completed` | INTEGER | No | `0` | Updated on job completion. |
| `is_available` | BOOLEAN | No | `true` | Can accept new jobs. |
| `is_deleted` | BOOLEAN | No | `false` | Soft delete. |
| `deleted_at` | TIMESTAMP | Yes | NULL | — |
| `created_at` | TIMESTAMP | No | AUTO | — |
| `updated_at` | TIMESTAMP | No | AUTO | — |

**Enums:**
```
worker_status: active | offline | banned | suspended | pending
```

**Indexes:**
- `idx_wp_status` → `worker_status`
- `idx_wp_available` → `is_available`

---

### Table 6: `verification_requests`

**Django Model:** `accounts.VerificationRequest`

**Purpose:**
KYC document submission queue. When a worker wants to be verified on the platform, they submit their identity documents. Admin staff review and approve or reject.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | No | PK. |
| `worker_id` | UUID | No | FK → `worker_profiles.user_id`, CASCADE. |
| `request_type` | VARCHAR(50) | No | Default: `initial_verification`. |
| `status` | VARCHAR(20) | No | `pending` \| `approved` \| `rejected`. |
| `documents_submitted` | JSONB | No | Array: `[{type: "aadhaar", url: "https://..."}]`. |
| `reviewed_by` | UUID | Yes | FK → `users.id` (staff only), SET_NULL. |
| `reviewed_at` | TIMESTAMP | Yes | Populated on review. |
| `rejection_reason` | TEXT | Yes | Reason if rejected. |
| `admin_notes` | TEXT | Yes | Internal notes. |
| `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | TIMESTAMP | No | Auto. |

**Indexes:**
- `idx_vr_status` → `status`
- `idx_vr_worker` → `worker_id`

---

## App 2: `marketplace` — Service Delivery

The core business logic layer. Manages the full service lifecycle from browsing to completion.

---

### Table 7: `categories`

**Django Model:** `marketplace.Category`

**Purpose:**
Service catalog. Represents the types of services available (e.g., Cleaning, Plumbing, Electrical). Originally called `skills` in the Supabase schema — renamed to `categories` for clarity.

**Soft Delete:** ✅ `is_deleted`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | INTEGER | No | PK, auto-increment. |
| `name` | VARCHAR(100) | No | UNIQUE. Service name. |
| `description` | TEXT | Yes | Blank allowed. |
| `icon` | VARCHAR(255) | Yes | Icon name or CDN URL. |
| `base_rate` | DECIMAL(12,2) | Yes | Platform default rate. **DecimalField, not Float.** |
| `is_active` | BOOLEAN | No | Default `true`. Hidden from marketplace if false. |
| `display_order` | SMALLINT | No | Default `0`. Controls UI tab ordering. |
| `is_deleted` | BOOLEAN | No | Default `false`. Soft delete. |
| `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | TIMESTAMP | No | Auto. |

**Indexes:**
- `idx_cat_active` on `(is_active, is_deleted)`
- `idx_cat_name` on `name`

---

### Table 8: `worker_categories`

**Django Model:** `marketplace.WorkerCategory`

**Purpose:**
Junction table linking workers to the service categories they can perform. Supports per-worker pricing via `rate_override`.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | No | PK. |
| `worker_id` | UUID | No | FK → `worker_profiles.user_id`, CASCADE. |
| `category_id` | INTEGER | No | FK → `categories.id`, PROTECT. |
| `is_primary` | BOOLEAN | No | Default `false`. Marks worker's specialty. |
| `rate_override` | DECIMAL(12,2) | Yes | If set, overrides `categories.base_rate` for this worker. |
| `years_experience` | SMALLINT | No | Default `0`. |
| `created_at` | TIMESTAMP | No | Auto. |

**UniqueConstraint:** `uniq_worker_category` on `(worker_id, category_id)` — a worker can only be linked to each category once.
**Index:** `idx_wc_composite` on `(worker_id, category_id)`

---

### Table 9: `addresses`

**Django Model:** `marketplace.Address`

**Purpose:**
Physical service delivery locations saved by users. A user can save multiple addresses and mark one as default. Jobs reference an address for service delivery.

| Column | DB Column | Type | Nullable | Description |
|---|---|---|---|---|
| `id` | `address_id` | UUID | No | PK. `db_column='address_id'` matches original. |
| `user` | `user_id` | UUID | No | FK → `users.id`, CASCADE. |
| `label` | `label` | VARCHAR(50) | Yes | e.g. `Home`, `Office`. |
| `address_line` | `address_line` | TEXT | No | Full address text. |
| `landmark` | `landmark` | VARCHAR(255) | Yes | Nearby landmark. |
| `city` | `city` | VARCHAR(100) | No | Indexed for geo-filtering. |
| `state` | `state` | VARCHAR(100) | No | — |
| `pincode` | `pincode` | VARCHAR(10) | No | — |
| `latitude` | `latitude` | DECIMAL(9,6) | Yes | **Replaces Float for precision.** |
| `longitude` | `longitude` | DECIMAL(9,6) | Yes | **Replaces Float for precision.** |
| `is_default` | `is_default` | BOOLEAN | No | Default `false`. |
| `created_at` | `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | `updated_at` | TIMESTAMP | No | Auto. |

**Indexes:**
- `idx_addr_user_default` on `(user_id, is_default)` — fast default address lookup
- `idx_addr_city` on `city` — geo-filtering

---

### Table 10: `jobs`

**Django Model:** `marketplace.Job`

**Purpose:**
The core service-request entity. Created by a customer. Progresses through a state machine from `pending` to `completed` or `cancelled`. Central table — most other tables reference it.

**Soft Delete:** ✅ `is_deleted` + `deleted_at` (legal audit trail for disputes)

| Column | DB Column | Type | Nullable | Description |
|---|---|---|---|---|
| `id` | `job_id` | UUID | No | PK. `db_column='job_id'` preserved. |
| `user` | `user_id` | UUID | No | FK → `users.id`, **PROTECT**. |
| `category` | `skill_id` | INTEGER | No | FK → `categories.id`, **PROTECT**. `db_column='skill_id'` preserved. |
| `address` | `address_id` | UUID | Yes | FK → `addresses.address_id`, SET_NULL. |
| `job_status` | `job_status` | VARCHAR(30) | No | State machine enum. See below. |
| `final_price` | `final_price` | DECIMAL(12,2) | Yes | Agreed price. **DecimalField, not Float.** |
| `description` | `description` | TEXT | Yes | Customer notes. |
| `scheduled_at` | `scheduled_at` | TIMESTAMP | Yes | Preferred service time. Indexed. |
| `cancellation_reason` | `cancellation_reason` | TEXT | Yes | Filled if cancelled. |
| `is_deleted` | `is_deleted` | BOOLEAN | No | Soft delete. |
| `deleted_at` | `deleted_at` | TIMESTAMP | Yes | Populated on soft delete. |
| `created_at` | `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | `updated_at` | TIMESTAMP | No | Auto. |

**Job Status State Machine:**
```
pending → accepted → in_progress → completed
       ↘                         ↘
        cancelled               disputed
```
Valid values: `pending | accepted | in_progress | completed | cancelled | disputed`

**Indexes:**
- `idx_jobs_status_date` on `(job_status, scheduled_at)` — **hot composite index** for dashboard queries
- `idx_jobs_user_status` on `(user_id, job_status)` — customer job list
- `idx_jobs_deleted` on `is_deleted`

**on_delete Rules:**
- `user → PROTECT`: Cannot delete a customer with jobs
- `category → PROTECT`: Cannot delete a category with jobs
- `address → SET_NULL`: Location deletion doesn't affect job record

---

### Table 11: `job_assignments`

**Django Model:** `marketplace.JobAssignment`

**Purpose:**
Tracks which worker is assigned to a job and the full execution timeline (accepted_at → started_at → completed_at). Uses `ForeignKey(job)` instead of `OneToOneField` — allows re-assignment if a worker backs out.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | No | PK. |
| `job_id` | UUID | No | FK → `jobs.job_id`, CASCADE. |
| `worker_id` | UUID | No | FK → `worker_profiles.user_id`, PROTECT. |
| `assignment_status` | VARCHAR(30) | No | See enum below. |
| `accepted_at` | TIMESTAMP | Yes | When worker accepted. |
| `started_at` | TIMESTAMP | Yes | When work began. |
| `completed_at` | TIMESTAMP | Yes | When work finished. |
| `cancelled_at` | TIMESTAMP | Yes | If cancelled. |
| `rejection_reason` | TEXT | Yes | Reason if rejected. |
| `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | TIMESTAMP | No | Auto. |

**Assignment Status Enum:**
```
assigned | accepted | rejected | started | completed | cancelled
```

**Indexes:**
- `idx_ja_job_status` on `(job_id, assignment_status)` — job's current assignment lookup
- `idx_ja_worker_status` on `(worker_id, assignment_status)` — worker's active jobs

---

### Table 12: `job_status_history`

**Django Model:** `marketplace.JobStatusHistory`

**Purpose:**
Immutable, append-only ledger of every state transition a job goes through. Provides full observability for debugging, dispute resolution, and fraud detection.

No `updated_at` — records are never modified.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | No | PK, auto-increment. |
| `job_id` | UUID | No | FK → `jobs.job_id`, CASCADE. |
| `old_status` | VARCHAR(30) | No | The status before the transition. |
| `new_status` | VARCHAR(30) | No | The status after the transition. |
| `changed_by` | UUID | Yes | FK → `users.id`, SET_NULL. Who made the change. |
| `reason` | TEXT | Yes | Optional explanation. |
| `created_at` | TIMESTAMP | No | Auto — immutable timestamp. |

**Index:** `idx_jsh_job` on `job_id`

---

## App 3: `finance` — Money & Payments

> 🔴 **Critical rule: ALL monetary columns in this app use `DECIMAL(12,2)`. Float is explicitly forbidden for financial data to avoid binary rounding drift (e.g., ₹99.9999999 instead of ₹100.00).**

---

### Table 13: `wallets`

**Django Model:** `finance.Wallet`

**Purpose:**
Per-user platform credit wallet. Normalized out of the `users` table so balance is a single source of truth. Holds escrow and platform credits.

**Concurrency Rule:** All balance updates MUST use:
```python
with transaction.atomic():
    wallet = Wallet.objects.select_for_update().get(user=user)
    wallet.current_balance += amount
    wallet.save()
```
This prevents race conditions when two transactions update the same wallet simultaneously.

**Relationship:** OneToOne → `users.id` (CASCADE)

| Column | Type | Nullable | Description |
|---|---|---|---|
| `user_id` | UUID | No | PK + FK → `users.id`, CASCADE. |
| `current_balance` | DECIMAL(12,2) | No | Default `0.00`. Min value `0`. |
| `currency` | VARCHAR(5) | No | Default `INR`. |
| `is_frozen` | BOOLEAN | No | Default `false`. Frozen wallets block all transfers. |
| `last_updated_at` | TIMESTAMP | No | Auto-updated. |
| `created_at` | TIMESTAMP | No | Auto. |

---

### Table 14: `transactions`

**Django Model:** `finance.Transaction`

**Purpose:**
Complete financial ledger. Every money movement on the platform creates exactly one record here — payments, refunds, worker payouts, and wallet top-ups.

| Column | DB Column | Type | Nullable | Description |
|---|---|---|---|---|
| `id` | `transaction_id` | UUID | No | PK. `db_column` preserved. |
| `job` | `job_id` | UUID | Yes | FK → `jobs.job_id`, **PROTECT**. |
| `from_user` | `from_user_id` | UUID | Yes | FK → `users.id`, **PROTECT**. Sender. |
| `to_user` | `to_user_id` | UUID | Yes | FK → `users.id`, **PROTECT**. Receiver. |
| `transaction_type` | `transaction_type` | VARCHAR(20) | No | See enum below. |
| `amount` | `amount` | DECIMAL(12,2) | No | 💰 Min `0`. |
| `currency` | `currency` | VARCHAR(5) | No | Default `INR`. |
| `transaction_status` | `transaction_status` | VARCHAR(20) | No | See enum below. |
| `payment_method` | `payment_method` | VARCHAR(30) | Yes | `upi`, `card`, `wallet`, `netbanking`. |
| `gateway_reference` | `gateway_reference` | VARCHAR(255) | Yes | External payment gateway ID. |
| `failure_reason` | `failure_reason` | TEXT | Yes | Filled on failed transactions. |
| `metadata` | `metadata` | JSONB | No | Default `{}`. Gateway response data. |
| `created_at` | `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | `updated_at` | TIMESTAMP | No | Auto. |

**Enums:**
```
transaction_type:   payment | refund | payout | top_up | reversal
transaction_status: pending | success | failed | reversed
```

**Indexes:** `idx_txn_status`, `idx_txn_job`, `idx_txn_from`, `idx_txn_to`

> ⚠️ All three FKs (`job`, `from_user`, `to_user`) use `on_delete=PROTECT`. Financial records must survive even if the related entity is soft-deleted.

---

### Table 15: `platform_commissions`

**Django Model:** `finance.PlatformCommission`

**Purpose:**
Tracks the platform's revenue share per completed job. Stored separately from transactions for cleaner financial reporting.

**Relationship:** OneToOne → `jobs.job_id` (PROTECT)

| Column | Type | Nullable | Description |
|---|---|---|---|
| `job_id` | UUID | No | PK + FK → `jobs.job_id`, PROTECT. |
| `commission_percentage` | DECIMAL(5,2) | No | Platform cut %. DB-checked: 0–100. |
| `commission_amount` | DECIMAL(12,2) | No | 💰 INR amount. |
| `is_settled` | BOOLEAN | No | Default `false`. True after payout. |
| `settled_at` | TIMESTAMP | Yes | Populated on settlement. |
| `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | TIMESTAMP | No | Auto. |

**CheckConstraint:** `chk_commission_pct_range` → `0 ≤ commission_percentage ≤ 100`

---

### Table 16: `payment_disputes`

**Django Model:** `finance.PaymentDispute`

**Purpose:**
Financial conflict management. When a customer or worker disputes a payment, a record is created here. Admin staff reviews, resolves, and may issue a refund transaction.

**Note:** The FK column to `jobs` is intentionally named `booking_id` (`db_column='booking_id'`) to match the original Supabase schema and frontend API expectations.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | No | PK. |
| `booking_id` | UUID | No | FK → `jobs.job_id`, PROTECT. `db_column='booking_id'`. |
| `raised_by` | UUID | No | FK → `users.id`, PROTECT. |
| `raised_by_type` | VARCHAR(20) | No | `customer` or `worker`. |
| `dispute_type` | VARCHAR(50) | Yes | Category of dispute. |
| `amount_disputed` | DECIMAL(12,2) | Yes | 💰 Amount in contention. |
| `description` | TEXT | Yes | User's description of issue. |
| `evidence_urls` | JSONB | No | Default `[]`. Array of evidence URLs. |
| `status` | VARCHAR(20) | No | `open` \| `in_review` \| `resolved` \| `dismissed`. |
| `resolution` | TEXT | Yes | Admin's resolution text. |
| `refund_amount` | DECIMAL(12,2) | Yes | 💰 If refund issued. |
| `assigned_to` | UUID | Yes | FK → `users.id` (staff), SET_NULL. |
| `resolved_by` | UUID | Yes | FK → `users.id`, SET_NULL. |
| `resolved_at` | TIMESTAMP | Yes | Resolution timestamp. |
| `admin_notes` | TEXT | Yes | Internal staff notes. |
| `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | TIMESTAMP | No | Auto. |

---

### Table 17: `ratings`

**Django Model:** `finance.Rating`

**Purpose:**
Post-job star ratings and text reviews. Bidirectional — both customer and worker can rate each other after a job completes. Enforces uniqueness: one review per (job, reviewer, type) combo.

| Column | DB Column | Type | Nullable | Description |
|---|---|---|---|---|
| `id` | `rating_id` | UUID | No | PK. `db_column` preserved. |
| `job` | `job_id` | UUID | No | FK → `jobs.job_id`, CASCADE. |
| `from_user` | `from_user_id` | UUID | No | FK → `users.id`, CASCADE. Reviewer. |
| `to_user` | `to_user_id` | UUID | No | FK → `users.id`, CASCADE. Reviewed party. |
| `rating_value` | `rating_value` | SMALLINT | No | 1–5 stars. DB level checked. |
| `review_text` | `review_text` | TEXT | Yes | Optional written review. |
| `rating_type` | `rating_type` | VARCHAR(20) | No | Default `job_review`. |
| `created_at` | `created_at` | TIMESTAMP | No | Auto. |

**Unique Together:** `(job_id, from_user_id, rating_type)` — prevents duplicate reviews.
**CheckConstraint:** `chk_rating_value_range` → `1 ≤ rating_value ≤ 5`

---

## App 4: `moderation` — Trust & Safety

Keeps the platform fair. All moderation data is designed to be permanent and auditable.

---

### Table 18: `reports`

**Django Model:** `moderation.Report`

**Purpose:**
General-purpose moderation tickets submitted by users to flag abuse, scams, bugs, or fake profiles. Admin staff reviews and resolves.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | No | PK. |
| `reporter_id` | UUID | No | FK → `users.id`, PROTECT. |
| `target_entity_type` | VARCHAR(50) | Yes | What was reported: `user`, `worker`, `job`. |
| `target_entity_id` | UUID | Yes | ID of the entity being reported. |
| `report_type` | VARCHAR(20) | No | `abuse` \| `scam` \| `bug` \| `fake` \| `spam` \| `other`. |
| `description` | TEXT | No | User's description. Required. |
| `status` | VARCHAR(20) | No | `open` \| `in_review` \| `resolved` \| `dismissed`. |
| `admin_notes` | TEXT | Yes | Internal resolution notes. |
| `resolved_by` | UUID | Yes | FK → `users.id` (staff only), SET_NULL. |
| `resolved_at` | TIMESTAMP | Yes | — |
| `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | TIMESTAMP | No | Auto. |

---

### Table 19: `banned_entities`

**Django Model:** `moderation.BannedEntity`

**Purpose:**
Registry of all platform bans. Uses `entity_type` as a string (not a FK) so we can ban diverse entity types — users, workers, IP addresses, and devices — all in one table.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | No | PK. |
| `entity_id` | UUID | No | ID of the banned entity. Indexed. |
| `entity_type` | VARCHAR(20) | No | `user` \| `worker` \| `ip` \| `device`. |
| `reason` | TEXT | No | Ban reason. Required. |
| `is_active` | BOOLEAN | No | Default `true`. Set `false` to lift ban. |
| `banned_by` | UUID | Yes | FK → `users.id` (staff only), SET_NULL. |
| `expires_at` | TIMESTAMP | Yes | NULL = permanent ban. |
| `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | TIMESTAMP | No | Auto. |

**Indexes:**
- `idx_ban_entity` on `(entity_id, entity_type)` — fast ban lookup
- `idx_ban_active` on `is_active`

---

### Table 20: `admin_actions`

**Django Model:** `moderation.AdminAction`

**Purpose:**
Explicit log of admin staff interventions. Unlike `audit_logs` (which captures all system events), this table specifically tracks deliberate staff actions (ban user, verify worker, respond to report, etc.) for workflow tracking and accountability.

| Column | DB Column | Type | Nullable | Description |
|---|---|---|---|---|
| `id` | `admin_action_id` | UUID | No | PK. `db_column` preserved. |
| `admin_user` | `admin_user_id` | UUID | No | FK → `users.id` (staff only), PROTECT. |
| `action_type` | `action_type` | VARCHAR(50) | No | e.g. `ban_user`, `approve_worker`. |
| `target_entity_type` | `target_entity_type` | VARCHAR(50) | Yes | What was acted on. |
| `target_entity_id` | `target_entity_id` | UUID | Yes | ID of affected entity. |
| `description` | `description` | TEXT | Yes | Human-readable action description. |
| `metadata` | `metadata` | JSONB | No | Default `{}`. Extra context data. |
| `created_at` | `created_at` | TIMESTAMP | No | Auto. |

---

### Table 21: `audit_logs`

**Django Model:** `moderation.AuditLog`

**Purpose:**
The platform's immutable system event log. Every significant action (create, update, delete, login, ban) is recorded here for security, compliance, and forensic analysis.

**Critical design rules enforced in code:**
1. `save()` raises `PermissionError` if record already exists → No updates allowed
2. `delete()` always raises `PermissionError` → No deletions allowed
3. Django Admin: `has_change_permission = False`, `has_delete_permission = False`
4. No `updated_at` column — records are created once and never changed

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | No | PK. |
| `admin_id` | UUID | Yes | FK → `users.id` (staff), SET_NULL. |
| `action_type` | VARCHAR(50) | No | `create`, `update`, `delete`, `login`, `logout`, `ban`. |
| `target_type` | VARCHAR(50) | Yes | `user`, `job`, `worker`, `system`. |
| `target_id` | UUID | Yes | ID of affected entity. |
| `description` | TEXT | Yes | Readable log message. |
| `ip_address` | INET | Yes | Client IP at time of action. |
| `user_agent` | TEXT | Yes | Browser/client info. |
| `before_data` | JSONB | Yes | Serialized entity state BEFORE change. |
| `after_data` | JSONB | Yes | Serialized entity state AFTER change. |
| `created_at` | TIMESTAMP | No | **Auto. This is the only timestamp.** |

**Indexes:**
- `idx_al_action` on `action_type`
- `idx_al_target` on `target_type`
- `idx_al_date` on `created_at` — chronological log queries

---

## App 5: `core` — System Infrastructure

Platform-level configuration and operational data.

---

### Table 22: `system_settings`

**Django Model:** `core.SystemSetting`

**Purpose:**
Dynamic runtime configuration store using a key-value pattern. Admins can change platform behavior (e.g., toggle maintenance mode, update platform fee %) without a code deploy.

**Note:** Primary key is a `TEXT` natural key (the setting name itself) — not UUID. This matches the original Supabase schema design.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `key` | TEXT (PK) | No | Setting identifier. e.g. `maintenance_mode`. |
| `value` | JSONB | No | Any JSON value. e.g. `{"enabled": true}`. |
| `description` | TEXT | Yes | Human-readable explanation. |
| `category` | VARCHAR(50) | Yes | Grouping label for admin UI display. |
| `is_public` | BOOLEAN | No | Default `false`. If `true`, readable by frontend. |
| `is_editable` | BOOLEAN | No | Default `true`. Protects read-only settings. |
| `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | TIMESTAMP | No | Auto. |

---

### Table 23: `admin_notifications`

**Django Model:** `core.AdminNotification`

**Purpose:**
In-app notification bell alerts for admin dashboard users. These are NOT emails — they are dashboard UI notifications triggered by system events (e.g., "New verification request", "Dispute opened", "System error").

A `recipient_id` of `NULL` means the notification is broadcast to all staff users.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | No | PK. |
| `recipient_id` | UUID | Yes | FK → `users.id` (staff), CASCADE. NULL = broadcast. |
| `title` | VARCHAR(255) | No | Notification heading. |
| `body` | TEXT | No | Notification content. |
| `notification_type` | VARCHAR(50) | Yes | Category tag for filtering. |
| `priority` | VARCHAR(20) | No | `low` \| `normal` \| `high` \| `critical`. |
| `data` | JSONB | No | Default `{}`. Payload for deep-linking. |
| `is_read` | BOOLEAN | No | Default `false`. |
| `read_at` | TIMESTAMP | Yes | Populated when admin marks as read. |
| `created_at` | TIMESTAMP | No | Auto. |

**Indexes:**
- `idx_notif_unread` on `(is_read, recipient_id)` — unread notification badge count
- `idx_notif_priority` on `priority`

**Method:** `mark_read()` — Sets `is_read=True`, `read_at=NOW()`, saves to DB.

---

### Table 24: `daily_statistics`

**Django Model:** `core.DailyStatistic`

**Purpose:**
Pre-aggregated analytics cache. Rather than running expensive `COUNT()`, `SUM()` queries live on every dashboard load, this table stores pre-computed metrics per day.

**Population:** Managed by a Django management command (`python manage.py aggregate_stats`) or a Celery periodic task scheduled at midnight IST.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | No | PK. |
| `date` | DATE | No | UNIQUE. The statistics date. |
| `total_bookings` | INTEGER | No | Default `0`. All jobs created this day. |
| `completed_bookings` | INTEGER | No | Default `0`. Jobs reaching `completed` status. |
| `cancelled_bookings` | INTEGER | No | Default `0`. Jobs cancelled this day. |
| `total_revenue` | DECIMAL(15,2) | No | 💰 Gross platform revenue. |
| `total_payouts` | DECIMAL(15,2) | No | 💰 Total worker payouts. |
| `platform_earnings` | DECIMAL(15,2) | No | 💰 Net platform commission. |
| `new_users` | INTEGER | No | Default `0`. New registrations. |
| `new_workers` | INTEGER | No | Default `0`. New worker signups. |
| `active_workers` | INTEGER | No | Default `0`. Workers with ≥1 job this day. |
| `metadata` | JSONB | No | Default `{}`. Extra breakdown data. |
| `created_at` | TIMESTAMP | No | Auto. |
| `updated_at` | TIMESTAMP | No | Auto. |

---

## Design Decisions Summary

| Decision | What It Means | Why |
|---|---|---|
| `DecimalField` for all money | 9 monetary columns converted from Float | Float has binary rounding, e.g. 0.1 + 0.2 ≠ 0.3 in IEEE 754 |
| `PROTECT` on financial FKs | Cannot delete parent if financial child exists | Prevents orphaned transaction records |
| Soft delete | `is_deleted` + `deleted_at` on users/workers/jobs | Legal compliance, dispute resolution, audit trail |
| Text PK for `system_settings` | Primary key is the key name string | Self-documenting, matches original schema |
| `AuditLog` immutability | `save()`/`delete()` override raises `PermissionError` | Security requirement — logs cannot be tampered with |
| `job → skill_id` column name | FK to `categories` uses `db_column='skill_id'` | Frontend expects `skill_id`; Django model calls it `category` |
| `booking_id` column on disputes | FK to `jobs` uses `db_column='booking_id'` | Frontend API expects `booking_id` in responses |
| ForeignKey for `job_assignments` | Not OneToOneField → allows re-assignment | Marketplace dynamics require worker reassignment capability |
| No `ADMINS` table | Replaced by `is_staff`/`is_superuser` | Django's built-in mechanism; cleaner and more secure |
| Wallet normalized to own table | Removed `wallet_balance` from `users` | Single source of truth; prevents balance sync bugs |

---

## Files in `docs/`

| File | Purpose |
|---|---|
| `tables_details.md` | This file — detailed per-table documentation |
| `tables_reference.md` | Quick reference: columns, keys, indexes, constraints |
| `tables_details.txt` | Plain-text version for non-markdown tools |
| `schema.mermaid` | Full ER diagram in Mermaid syntax |
