# Job Karo — Django Backend: Complete Tables Reference

> **Quick-reference sheet for all 22 database tables.**
> Shows every table name, Django model, app, primary key, foreign keys, unique constraints, indexes, and relationships at a glance.

---

## Table of Contents

1. [App Map](#app-map)
2. [Identity & Access](#1-identity--access-app-accounts)
3. [Marketplace](#2-marketplace-app-marketplace)
4. [Finance](#3-finance-app-finance)
5. [Moderation](#4-moderation-app-moderation)
6. [System / Core](#5-system--core-app-core)
7. [Relationship Matrix](#relationship-matrix)
8. [All Indexes](#all-indexes)
9. [All Constraints](#all-constraints)
10. [on_delete Rules Summary](#on_delete-rules-summary)

---

## App Map

| # | DB Table Name | Django Model | App |
|---|---|---|---|
| 1 | `users` | `accounts.User` | accounts |
| 2 | `user_profiles` | `accounts.UserProfile` | accounts |
| 3 | `roles` | `accounts.Role` | accounts |
| 4 | `user_roles` | `accounts.UserRole` | accounts |
| 5 | `worker_profiles` | `accounts.WorkerProfile` | accounts |
| 6 | `verification_requests` | `accounts.VerificationRequest` | accounts |
| 7 | `categories` | `marketplace.Category` | marketplace |
| 8 | `worker_categories` | `marketplace.WorkerCategory` | marketplace |
| 9 | `addresses` | `marketplace.Address` | marketplace |
| 10 | `jobs` | `marketplace.Job` | marketplace |
| 11 | `job_assignments` | `marketplace.JobAssignment` | marketplace |
| 12 | `job_status_history` | `marketplace.JobStatusHistory` | marketplace |
| 13 | `wallets` | `finance.Wallet` | finance |
| 14 | `transactions` | `finance.Transaction` | finance |
| 15 | `platform_commissions` | `finance.PlatformCommission` | finance |
| 16 | `payment_disputes` | `finance.PaymentDispute` | finance |
| 17 | `ratings` | `finance.Rating` | finance |
| 18 | `reports` | `moderation.Report` | moderation |
| 19 | `banned_entities` | `moderation.BannedEntity` | moderation |
| 20 | `admin_actions` | `moderation.AdminAction` | moderation |
| 21 | `audit_logs` | `moderation.AuditLog` | moderation |
| 22 | `system_settings` | `core.SystemSetting` | core |
| 23 | `admin_notifications` | `core.AdminNotification` | core |
| 24 | `daily_statistics` | `core.DailyStatistic` | core |

---

## 1. Identity & Access (App: `accounts`)

### `users`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` UUID |
| **Unique** | `phone`, `email` |
| **Indexes** | `idx_users_phone`, `idx_users_email`, `idx_users_status`, `idx_users_deleted` |
| **on_delete incoming** | CASCADE from `user_profiles`, `user_roles`, `worker_profiles`, `addresses`, `wallets` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `phone` | VARCHAR(15) | UNIQUE. Primary login field |
| `email` | VARCHAR(255) | UNIQUE, nullable |
| `password` | TEXT | Django PBKDF2 hash |
| `account_status` | VARCHAR(20) | `active` \| `suspended` \| `banned` |
| `is_verified` | BOOLEAN | KYC flag |
| `is_active` | BOOLEAN | Django auth — login allowed |
| `is_staff` | BOOLEAN | Django admin access |
| `is_superuser` | BOOLEAN | All permissions |
| `is_deleted` | BOOLEAN | Soft delete flag |
| `deleted_at` | TIMESTAMP | Populated on soft delete |
| `created_at` | TIMESTAMP | Registration time (date_joined) |
| `updated_at` | TIMESTAMP | Auto-updated |
| `last_login` | TIMESTAMP | Managed by Django auth |

---

### `user_profiles`
| Attribute | Value |
|---|---|
| **Primary Key** | `user_id` UUID (FK → `users.id`) |
| **Relationship** | OneToOne with `users` |

| Column | DB Type | Notes |
|---|---|---|
| `user_id` | UUID | PK + FK → `users.id`, CASCADE |
| `full_name` | VARCHAR(255) | Blank allowed |
| `gender` | VARCHAR(10) | `male` \| `female` \| `other`, nullable |
| `profile_photo_url` | TEXT | Stored in MEDIA_ROOT/profiles/ |
| `date_of_birth` | DATE | Nullable |
| `language_preference` | VARCHAR(10) | Default `en` |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `roles`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` INTEGER (auto-increment) |
| **Unique** | `role_name` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | INTEGER | PK, auto |
| `role_name` | VARCHAR(50) | UNIQUE. e.g. `customer`, `worker` |
| `description` | TEXT | Blank allowed |
| `created_at` | TIMESTAMP | Auto |

> ⚠️ These are **business roles** — not Django's permission system (Groups).

---

### `user_roles`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` BIGINT (auto) |
| **Foreign Keys** | `user_id` → `users.id`, `role_id` → `roles.id` |
| **Unique Together** | `(user_id, role_id)` |
| **Indexes** | `idx_user_roles_active` on `(user, is_active)` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | BIGINT | PK |
| `user_id` | UUID | FK → `users.id`, CASCADE |
| `role_id` | INTEGER | FK → `roles.id`, PROTECT |
| `is_active` | BOOLEAN | Default `true` |
| `assigned_at` | TIMESTAMP | Auto |

---

### `worker_profiles`
| Attribute | Value |
|---|---|
| **Primary Key** | `user_id` UUID (FK → `users.id`) |
| **Unique** | `government_id_number` |
| **Indexes** | `idx_wp_status`, `idx_wp_available` |
| **Soft Delete** | ✅ `is_deleted` + `deleted_at` |

| Column | DB Type | Notes |
|---|---|---|
| `user_id` | UUID | PK + FK → `users.id`, CASCADE |
| `worker_status` | VARCHAR(20) | `active` \| `offline` \| `banned` \| `suspended` \| `pending` |
| `government_id_type` | VARCHAR(30) | Blank allowed |
| `government_id_number` | VARCHAR(30) | UNIQUE, nullable |
| `experience_years` | SMALLINT | Default `0` |
| `bio` | TEXT | Blank allowed |
| `average_rating` | DECIMAL(3,2) | Default `0.00` |
| `total_jobs_completed` | INTEGER | Default `0` |
| `is_available` | BOOLEAN | Default `true` |
| `is_deleted` | BOOLEAN | Soft delete |
| `deleted_at` | TIMESTAMP | Nullable |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `verification_requests`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` UUID |
| **Foreign Keys** | `worker_id` → `worker_profiles.user_id`, `reviewed_by` → `users.id` |
| **Indexes** | `idx_vr_status`, `idx_vr_worker` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `worker_id` | UUID | FK → `worker_profiles.user_id`, CASCADE |
| `request_type` | VARCHAR(50) | Default `initial_verification` |
| `status` | VARCHAR(20) | `pending` \| `approved` \| `rejected` |
| `documents_submitted` | JSONB | Array of `{type, url}` objects |
| `reviewed_by` | UUID | FK → `users.id` (is_staff only), SET_NULL |
| `reviewed_at` | TIMESTAMP | Nullable |
| `rejection_reason` | TEXT | Blank allowed |
| `admin_notes` | TEXT | Blank allowed |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

## 2. Marketplace (App: `marketplace`)

### `categories`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` INTEGER (auto-increment) |
| **Unique** | `name` |
| **Indexes** | `idx_cat_active`, `idx_cat_name` |
| **Soft Delete** | ✅ `is_deleted` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | INTEGER | PK |
| `name` | VARCHAR(100) | UNIQUE |
| `description` | TEXT | Blank allowed |
| `icon` | VARCHAR(255) | Icon name/URL |
| `base_rate` | DECIMAL(12,2) | Nullable |
| `is_active` | BOOLEAN | Default `true` |
| `display_order` | SMALLINT | Default `0` |
| `is_deleted` | BOOLEAN | Soft delete |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `worker_categories`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` UUID |
| **Foreign Keys** | `worker_id` → `worker_profiles.user_id`, `category_id` → `categories.id` |
| **UniqueConstraint** | `uniq_worker_category` on `(worker_id, category_id)` |
| **Indexes** | `idx_wc_composite` on `(worker, category)` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `worker_id` | UUID | FK → `worker_profiles.user_id`, CASCADE |
| `category_id` | INTEGER | FK → `categories.id`, PROTECT |
| `is_primary` | BOOLEAN | Default `false` |
| `rate_override` | DECIMAL(12,2) | Nullable — custom price |
| `years_experience` | SMALLINT | Default `0` |
| `created_at` | TIMESTAMP | Auto |

---

### `addresses`
| Attribute | Value |
|---|---|
| **Primary Key** | `address_id` UUID |
| **Foreign Keys** | `user_id` → `users.id` |
| **Indexes** | `idx_addr_user_default`, `idx_addr_city` |

| Column | DB Type | Notes |
|---|---|---|
| `address_id` | UUID | PK (db_column preserved) |
| `user_id` | UUID | FK → `users.id`, CASCADE |
| `label` | VARCHAR(50) | e.g. `Home`, `Office` |
| `address_line` | TEXT | Full address |
| `landmark` | VARCHAR(255) | Blank allowed |
| `city` | VARCHAR(100) | Indexed |
| `state` | VARCHAR(100) | — |
| `pincode` | VARCHAR(10) | — |
| `latitude` | DECIMAL(9,6) | Nullable. Replaces Float |
| `longitude` | DECIMAL(9,6) | Nullable. Replaces Float |
| `is_default` | BOOLEAN | Default `false` |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `jobs`
| Attribute | Value |
|---|---|
| **Primary Key** | `job_id` UUID (db_column preserved) |
| **Foreign Keys** | `user_id`, `skill_id` (category), `address_id` |
| **Indexes** | `idx_jobs_status_date`, `idx_jobs_user_status`, `idx_jobs_deleted` |
| **Soft Delete** | ✅ `is_deleted` + `deleted_at` |

| Column | DB Type | Notes |
|---|---|---|
| `job_id` | UUID | PK |
| `user_id` | UUID | FK → `users.id`, PROTECT |
| `skill_id` | INTEGER | FK → `categories.id`, PROTECT (original name preserved) |
| `address_id` | UUID | FK → `addresses.address_id`, SET_NULL |
| `job_status` | VARCHAR(30) | `pending` \| `accepted` \| `in_progress` \| `completed` \| `cancelled` \| `disputed` |
| `final_price` | DECIMAL(12,2) | Nullable. **Never Float.** |
| `description` | TEXT | Blank allowed |
| `scheduled_at` | TIMESTAMP | Nullable, indexed |
| `cancellation_reason` | TEXT | Blank allowed |
| `is_deleted` | BOOLEAN | Soft delete |
| `deleted_at` | TIMESTAMP | Nullable |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `job_assignments`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` UUID |
| **Foreign Keys** | `job_id` → `jobs.job_id`, `worker_id` → `worker_profiles.user_id` |
| **Indexes** | `idx_ja_job_status`, `idx_ja_worker_status` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `job_id` | UUID | FK → `jobs.job_id`, CASCADE |
| `worker_id` | UUID | FK → `worker_profiles.user_id`, PROTECT |
| `assignment_status` | VARCHAR(30) | `assigned` \| `accepted` \| `rejected` \| `started` \| `completed` \| `cancelled` |
| `accepted_at` | TIMESTAMP | Nullable |
| `started_at` | TIMESTAMP | Nullable |
| `completed_at` | TIMESTAMP | Nullable |
| `cancelled_at` | TIMESTAMP | Nullable |
| `rejection_reason` | TEXT | Blank allowed |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `job_status_history`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` BIGINT (auto) |
| **Foreign Keys** | `job_id` → `jobs.job_id`, `changed_by` → `users.id` |
| **Indexes** | `idx_jsh_job` |
| **Append-only** | No `updated_at`; records are immutable |

| Column | DB Type | Notes |
|---|---|---|
| `id` | BIGINT | PK |
| `job_id` | UUID | FK → `jobs.job_id`, CASCADE |
| `old_status` | VARCHAR(30) | Previous job state |
| `new_status` | VARCHAR(30) | New job state |
| `changed_by` | UUID | FK → `users.id`, SET_NULL |
| `reason` | TEXT | Blank allowed |
| `created_at` | TIMESTAMP | Auto |

---

## 3. Finance (App: `finance`)

> 🔴 **ALL monetary columns use `DECIMAL(12,2)`. Float is strictly forbidden.**

### `wallets`
| Attribute | Value |
|---|---|
| **Primary Key** | `user_id` UUID (FK → `users.id`) |
| **Relationship** | OneToOne with `users` |
| **Concurrency** | MUST use `select_for_update()` on writes |

| Column | DB Type | Notes |
|---|---|---|
| `user_id` | UUID | PK + FK → `users.id`, CASCADE |
| `current_balance` | DECIMAL(12,2) | Default `0.00`, min `0` |
| `currency` | VARCHAR(5) | Default `INR` |
| `is_frozen` | BOOLEAN | Frozen wallets block transactions |
| `last_updated_at` | TIMESTAMP | Auto |
| `created_at` | TIMESTAMP | Auto |

---

### `transactions`
| Attribute | Value |
|---|---|
| **Primary Key** | `transaction_id` UUID (db_column preserved) |
| **Foreign Keys** | `job_id`, `from_user_id`, `to_user_id` — all PROTECT |
| **Indexes** | `idx_txn_status`, `idx_txn_job`, `idx_txn_from`, `idx_txn_to` |

| Column | DB Type | Notes |
|---|---|---|
| `transaction_id` | UUID | PK |
| `job_id` | UUID | FK → `jobs.job_id`, PROTECT, nullable |
| `from_user_id` | UUID | FK → `users.id`, PROTECT, nullable |
| `to_user_id` | UUID | FK → `users.id`, PROTECT, nullable |
| `transaction_type` | VARCHAR(20) | `payment` \| `refund` \| `payout` \| `top_up` \| `reversal` |
| `amount` | DECIMAL(12,2) | NOT NULL, min `0` |
| `currency` | VARCHAR(5) | Default `INR` |
| `transaction_status` | VARCHAR(20) | `pending` \| `success` \| `failed` \| `reversed` |
| `payment_method` | VARCHAR(30) | `upi`, `card`, `wallet`, `netbanking` |
| `gateway_reference` | VARCHAR(255) | Gateway transaction ID |
| `failure_reason` | TEXT | Blank allowed |
| `metadata` | JSONB | Default `{}` |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `platform_commissions`
| Attribute | Value |
|---|---|
| **Primary Key** | `job_id` UUID (FK → `jobs.job_id`) |
| **Relationship** | OneToOne with `jobs` |
| **CheckConstraint** | `chk_commission_pct_range`: `0 ≤ commission_percentage ≤ 100` |

| Column | DB Type | Notes |
|---|---|---|
| `job_id` | UUID | PK + FK → `jobs.job_id`, PROTECT |
| `commission_percentage` | DECIMAL(5,2) | NOT NULL, checked 0–100 |
| `commission_amount` | DECIMAL(12,2) | NOT NULL |
| `is_settled` | BOOLEAN | Default `false` |
| `settled_at` | TIMESTAMP | Nullable |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `payment_disputes`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` UUID |
| **Foreign Keys** | `booking_id` → `jobs.job_id` (PROTECT), `raised_by` → `users.id` |
| **Indexes** | `idx_disputes_status`, `idx_disputes_job` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `booking_id` | UUID | FK → `jobs.job_id`, PROTECT (original name preserved) |
| `raised_by` | UUID | FK → `users.id`, PROTECT |
| `raised_by_type` | VARCHAR(20) | `customer` or `worker` |
| `dispute_type` | VARCHAR(50) | Blank allowed |
| `amount_disputed` | DECIMAL(12,2) | Nullable |
| `description` | TEXT | Blank allowed |
| `evidence_urls` | JSONB | Default `[]` |
| `status` | VARCHAR(20) | `open` \| `in_review` \| `resolved` \| `dismissed` |
| `resolution` | TEXT | Admin decision text |
| `refund_amount` | DECIMAL(12,2) | Nullable |
| `assigned_to` | UUID | FK → `users.id` (staff only), SET_NULL |
| `resolved_by` | UUID | FK → `users.id`, SET_NULL |
| `resolved_at` | TIMESTAMP | Nullable |
| `admin_notes` | TEXT | Blank allowed |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `ratings`
| Attribute | Value |
|---|---|
| **Primary Key** | `rating_id` UUID (db_column preserved) |
| **Foreign Keys** | `job_id`, `from_user_id`, `to_user_id` |
| **Unique Together** | `(job_id, from_user_id, rating_type)` |
| **CheckConstraint** | `chk_rating_value_range`: `1 ≤ rating_value ≤ 5` |

| Column | DB Type | Notes |
|---|---|---|
| `rating_id` | UUID | PK |
| `job_id` | UUID | FK → `jobs.job_id`, CASCADE |
| `from_user_id` | UUID | FK → `users.id`, CASCADE |
| `to_user_id` | UUID | FK → `users.id`, CASCADE |
| `rating_value` | SMALLINT | 1–5 stars, DB-level checked |
| `review_text` | TEXT | Blank allowed |
| `rating_type` | VARCHAR(20) | Default `job_review` |
| `created_at` | TIMESTAMP | Auto |

---

## 4. Moderation (App: `moderation`)

### `reports`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` UUID |
| **Foreign Keys** | `reporter_id` → `users.id` (PROTECT), `resolved_by` → `users.id` |
| **Indexes** | `idx_reports_status`, `idx_reports_type`, `idx_reports_reporter` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `reporter_id` | UUID | FK → `users.id`, PROTECT |
| `target_entity_type` | VARCHAR(50) | `user`, `worker`, `job` |
| `target_entity_id` | UUID | Nullable — the reported entity's ID |
| `report_type` | VARCHAR(20) | `abuse` \| `scam` \| `bug` \| `fake` \| `spam` \| `other` |
| `description` | TEXT | NOT NULL |
| `status` | VARCHAR(20) | `open` \| `in_review` \| `resolved` \| `dismissed` |
| `admin_notes` | TEXT | Blank allowed |
| `resolved_by` | UUID | FK → `users.id` (staff), SET_NULL |
| `resolved_at` | TIMESTAMP | Nullable |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `banned_entities`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` UUID |
| **Foreign Keys** | `banned_by` → `users.id` (staff only) |
| **Indexes** | `idx_ban_entity` on `(entity_id, entity_type)`, `idx_ban_active` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `entity_id` | UUID | ID of banned entity (user/worker/IP/device) |
| `entity_type` | VARCHAR(20) | `user` \| `worker` \| `ip` \| `device` |
| `reason` | TEXT | NOT NULL |
| `is_active` | BOOLEAN | Default `true` |
| `banned_by` | UUID | FK → `users.id` (staff only), SET_NULL |
| `expires_at` | TIMESTAMP | Nullable — `null` = permanent |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `admin_actions`
| Attribute | Value |
|---|---|
| **Primary Key** | `admin_action_id` UUID (db_column preserved) |
| **Foreign Keys** | `admin_user_id` → `users.id` (staff only), PROTECT |

| Column | DB Type | Notes |
|---|---|---|
| `admin_action_id` | UUID | PK |
| `admin_user_id` | UUID | FK → `users.id` (is_staff=True), PROTECT |
| `action_type` | VARCHAR(50) | Indexed |
| `target_entity_type` | VARCHAR(50) | Blank allowed |
| `target_entity_id` | UUID | Nullable |
| `description` | TEXT | Blank allowed |
| `metadata` | JSONB | Default `{}` |
| `created_at` | TIMESTAMP | Auto |

---

### `audit_logs`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` UUID |
| **Foreign Keys** | `admin_id` → `users.id` (staff only), SET_NULL |
| **Indexes** | `idx_al_action`, `idx_al_target`, `idx_al_date` |
| **Immutable** | `save()` and `delete()` both raise `PermissionError` on existing records |

| Column | DB Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `admin_id` | UUID | FK → `users.id`, SET_NULL, nullable |
| `action_type` | VARCHAR(50) | `create`, `update`, `delete`, `login`, `ban` |
| `target_type` | VARCHAR(50) | `user`, `job`, `worker`, `system` |
| `target_id` | UUID | Nullable |
| `description` | TEXT | Blank allowed |
| `ip_address` | INET | Nullable |
| `user_agent` | TEXT | Blank allowed |
| `before_data` | JSONB | State before change |
| `after_data` | JSONB | State after change |
| `created_at` | TIMESTAMP | **Auto. No `updated_at` — immutable.** |

---

## 5. System / Core (App: `core`)

### `system_settings`
| Attribute | Value |
|---|---|
| **Primary Key** | `key` TEXT (natural key — matches original schema) |

| Column | DB Type | Notes |
|---|---|---|
| `key` | TEXT | PK — setting identifier |
| `value` | JSONB | NOT NULL — any JSON type |
| `description` | TEXT | Blank allowed |
| `category` | VARCHAR(50) | Grouping label |
| `is_public` | BOOLEAN | Exposed to frontend API |
| `is_editable` | BOOLEAN | Default `true` |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `admin_notifications`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` UUID |
| **Foreign Keys** | `recipient_id` → `users.id` (staff only), CASCADE |
| **Indexes** | `idx_notif_unread`, `idx_notif_priority` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `recipient_id` | UUID | FK → `users.id`, CASCADE, nullable (null = broadcast) |
| `title` | VARCHAR(255) | NOT NULL |
| `body` | TEXT | NOT NULL |
| `notification_type` | VARCHAR(50) | Blank allowed |
| `priority` | VARCHAR(20) | `low` \| `normal` \| `high` \| `critical` |
| `data` | JSONB | Contextual payload |
| `is_read` | BOOLEAN | Default `false` |
| `read_at` | TIMESTAMP | Nullable |
| `created_at` | TIMESTAMP | Auto |

---

### `daily_statistics`
| Attribute | Value |
|---|---|
| **Primary Key** | `id` UUID |
| **Unique** | `date` |

| Column | DB Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `date` | DATE | UNIQUE |
| `total_bookings` | INTEGER | Default `0` |
| `completed_bookings` | INTEGER | Default `0` |
| `cancelled_bookings` | INTEGER | Default `0` |
| `total_revenue` | DECIMAL(15,2) | Default `0` |
| `total_payouts` | DECIMAL(15,2) | Default `0` |
| `platform_earnings` | DECIMAL(15,2) | Default `0` |
| `new_users` | INTEGER | Default `0` |
| `new_workers` | INTEGER | Default `0` |
| `active_workers` | INTEGER | Default `0` |
| `metadata` | JSONB | Default `{}` |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

## Relationship Matrix

| Parent Table | Child Table | Type | FK Column | on_delete |
|---|---|---|---|---|
| `users` | `user_profiles` | OneToOne | `user_id` | CASCADE |
| `users` | `user_roles` | FK | `user_id` | CASCADE |
| `roles` | `user_roles` | FK | `role_id` | PROTECT |
| `users` | `worker_profiles` | OneToOne | `user_id` | CASCADE |
| `users` | `addresses` | FK | `user_id` | CASCADE |
| `users` | `wallets` | OneToOne | `user_id` | CASCADE |
| `users` | `jobs` | FK | `user_id` | **PROTECT** |
| `users` | `transactions` (from) | FK | `from_user_id` | **PROTECT** |
| `users` | `transactions` (to) | FK | `to_user_id` | **PROTECT** |
| `users` | `ratings` (from) | FK | `from_user_id` | CASCADE |
| `users` | `ratings` (to) | FK | `to_user_id` | CASCADE |
| `users` | `reports` | FK | `reporter_id` | **PROTECT** |
| `users` | `payment_disputes` | FK | `raised_by` | **PROTECT** |
| `users` | `admin_actions` | FK | `admin_user_id` | **PROTECT** |
| `users` | `audit_logs` | FK | `admin_id` | SET_NULL |
| `users` | `verification_requests` (reviewer) | FK | `reviewed_by` | SET_NULL |
| `users` | `admin_notifications` | FK | `recipient_id` | CASCADE |
| `worker_profiles` | `worker_categories` | FK | `worker_id` | CASCADE |
| `worker_profiles` | `job_assignments` | FK | `worker_id` | **PROTECT** |
| `worker_profiles` | `verification_requests` | FK | `worker_id` | CASCADE |
| `categories` | `worker_categories` | FK | `category_id` | **PROTECT** |
| `categories` | `jobs` | FK | `skill_id` | **PROTECT** |
| `addresses` | `jobs` | FK | `address_id` | SET_NULL |
| `jobs` | `job_assignments` | FK | `job_id` | CASCADE |
| `jobs` | `job_status_history` | FK | `job_id` | CASCADE |
| `jobs` | `transactions` | FK | `job_id` | **PROTECT** |
| `jobs` | `platform_commissions` | OneToOne | `job_id` | **PROTECT** |
| `jobs` | `payment_disputes` | FK | `booking_id` | **PROTECT** |
| `jobs` | `ratings` | FK | `job_id` | CASCADE |

---

## All Indexes

| Index Name | Table | Columns | Type |
|---|---|---|---|
| `idx_users_phone` | `users` | `phone` | Single |
| `idx_users_email` | `users` | `email` | Single |
| `idx_users_status` | `users` | `account_status` | Single |
| `idx_users_deleted` | `users` | `is_deleted` | Single |
| `idx_user_roles_active` | `user_roles` | `(user_id, is_active)` | **Composite** |
| `idx_vr_status` | `verification_requests` | `status` | Single |
| `idx_vr_worker` | `verification_requests` | `worker_id` | Single |
| `idx_wp_status` | `worker_profiles` | `worker_status` | Single |
| `idx_wp_available` | `worker_profiles` | `is_available` | Single |
| `idx_cat_active` | `categories` | `(is_active, is_deleted)` | **Composite** |
| `idx_cat_name` | `categories` | `name` | Single |
| `idx_wc_composite` | `worker_categories` | `(worker_id, category_id)` | **Composite** |
| `idx_addr_user_default` | `addresses` | `(user_id, is_default)` | **Composite** |
| `idx_addr_city` | `addresses` | `city` | Single |
| `idx_jobs_status_date` | `jobs` | `(job_status, scheduled_at)` | **Composite** |
| `idx_jobs_user_status` | `jobs` | `(user_id, job_status)` | **Composite** |
| `idx_jobs_deleted` | `jobs` | `is_deleted` | Single |
| `idx_ja_job_status` | `job_assignments` | `(job_id, assignment_status)` | **Composite** |
| `idx_ja_worker_status` | `job_assignments` | `(worker_id, assignment_status)` | **Composite** |
| `idx_jsh_job` | `job_status_history` | `job_id` | Single |
| `idx_txn_status` | `transactions` | `transaction_status` | Single |
| `idx_txn_job` | `transactions` | `job_id` | Single |
| `idx_txn_from` | `transactions` | `from_user_id` | Single |
| `idx_txn_to` | `transactions` | `to_user_id` | Single |
| `idx_disputes_status` | `payment_disputes` | `status` | Single |
| `idx_disputes_job` | `payment_disputes` | `booking_id` | Single |
| `idx_reports_status` | `reports` | `status` | Single |
| `idx_reports_type` | `reports` | `report_type` | Single |
| `idx_reports_reporter` | `reports` | `reporter_id` | Single |
| `idx_ban_entity` | `banned_entities` | `(entity_id, entity_type)` | **Composite** |
| `idx_ban_active` | `banned_entities` | `is_active` | Single |
| `idx_al_action` | `audit_logs` | `action_type` | Single |
| `idx_al_target` | `audit_logs` | `target_type` | Single |
| `idx_al_date` | `audit_logs` | `created_at` | Single |
| `idx_notif_unread` | `admin_notifications` | `(is_read, recipient_id)` | **Composite** |
| `idx_notif_priority` | `admin_notifications` | `priority` | Single |

**Total: 36 indexes (10 composite, 26 single)**

---

## All Constraints

### Unique Constraints
| Constraint | Table | Columns |
|---|---|---|
| `users_phone_key` | `users` | `phone` |
| `users_email_key` | `users` | `email` |
| `roles_role_name_key` | `roles` | `role_name` |
| `user_roles_user_id_role_id_key` | `user_roles` | `(user_id, role_id)` |
| `worker_profiles_govt_id_key` | `worker_profiles` | `government_id_number` |
| `categories_name_key` | `categories` | `name` |
| `uniq_worker_category` | `worker_categories` | `(worker_id, category_id)` |
| `ratings_unique_review` | `ratings` | `(job_id, from_user_id, rating_type)` |
| `daily_statistics_date_key` | `daily_statistics` | `date` |

### Check Constraints
| Constraint | Table | Rule |
|---|---|---|
| `chk_commission_pct_range` | `platform_commissions` | `0 ≤ commission_percentage ≤ 100` |
| `chk_rating_value_range` | `ratings` | `1 ≤ rating_value ≤ 5` |

---

## `on_delete` Rules Summary

| Rule | Tables Used On | Why |
|---|---|---|
| **CASCADE** | Child profiles, roles, addresses, unimportant children | Deleting parent removes child naturally |
| **PROTECT** | Financial FKs (transactions, commissions, disputes), jobs→user, jobs→category, assignments→worker | Cannot delete referenced data if money is involved |
| **SET_NULL** | Reviewer, changed_by, admin FKs | Admin can be removed; the record persists with null |

> ⚠️ `PROTECT` is the most important rule — it prevents accidental deletion of financial data and is deliberately chosen over `CASCADE` wherever money is involved.
