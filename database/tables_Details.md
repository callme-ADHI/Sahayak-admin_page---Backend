# JOB KARO ADMIN - DATABASE DOCUMENTATION

**Project:** Job Karo Admin Dashboard
**Database:** PostgreSQL (Supabase)
**Version:** 1.0.0 (Post-Migration)

This document provides a formal listing of all tables, views, and relationships in the database schema after applying the Admin compatibility layers (`1.sql`, `2.sql`, `3.sql`).

---

## 1. CORE ENTITIES

### **users** (Table)
*Stores all registered users and workers.*

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK, Default: v4() | Renamed from `user_id`. Primary Key. |
| phone | VARCHAR(15) | UNIQUE, NOT NULL | User's phone number. |
| email | VARCHAR(255) | UNIQUE | User's email address. |
| password_hash | TEXT | NOT NULL | Hashed password. |
| account_status | VARCHAR(20) | Default: 'active' | status: active, banned, suspended. |
| is_verified | BOOLEAN | Default: FALSE | If the user's identity is verified. |
| name | TEXT | | Full name (merged from profile). |
| profile_photo | TEXT | | Profile image URL. |
| wallet_balance | NUMERIC(10,2) | Default: 0 | Current wallet balance. |
| created_at | TIMESTAMP | Default: NOW() | Registration timestamp. |

### **workers** (View)
*A consolidated view of `worker_profiles` and `users` for the Admin Dashboard.*

| Column | Type | Source | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | `worker_profiles.user_id` | Worker's unique ID (same as user_id). |
| name | TEXT | `users.name` | Worker's full name. |
| phone | TEXT | `users.phone` | Contact number. |
| status | VARCHAR | `worker_profiles.worker_status` | Current logical status. |
| verification_status | TEXT | Computed | 'approved' or 'pending' based on `is_verified`. |
| is_available | BOOLEAN | `worker_profiles` | Online/Offline status. |
| skills | TEXT[] | Computed | Array of skill names. |
| experience_years | INT | `worker_profiles` | Years of experience. |

### **admins** (Table)
*System administrators with access to the dashboard.*

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK, Default: v4() | Unique Admin ID. |
| auth_user_id | UUID | FK -> users(id) | Link to auth system user. |
| name | TEXT | NOT NULL | Admin's full name. |
| email | TEXT | UNIQUE, NOT NULL | Admin's email address. |
| role | TEXT | Default: 'admin' | Role: 'super_admin', 'admin', 'support'. |
| permissions | JSONB | Default: '{}' | Custom permission flags. |
| status | TEXT | Default: 'active' | active, inactive. |

---

## 2. SERVICE MANAGEMENT

### **categories** (Table)
*Renamed from `skills`. Service categories offered on the platform.*

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | SERIAL | PK | Renamed from `skill_id`. |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Renamed from `skill_name`. |
| description | TEXT | | Service description. |
| icon | TEXT | | URL/Icon name for UI display. |
| base_rate | NUMERIC(10,2) | | Standard base price for this service. |
| is_active | BOOLEAN | Default: TRUE | If the category is visible to users. |

### **worker_categories** (Table)
*Links workers to the categories they perform.*

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK, Default: v4() | Unique link ID. |
| worker_id | UUID | FK -> workers(id) | The service provider. |
| category_id | INT | FK -> categories(id) | The service offered. |
| is_primary | BOOLEAN | Default: FALSE | If this is their main skill. |
| rate_override | NUMERIC(10,2) | | Custom rate for this worker. |

---

## 3. BOOKINGS & TRANSACTIONS

### **bookings** (View)
*Maps `jobs` and `job_assignments` to a unified Booking entity.*

| Column | Type | Source | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | `jobs.job_id` | Unique Booking/Job ID. |
| user_id | UUID | `jobs.user_id` | Customer ID. |
| worker_id | UUID | `job_assignments.worker_id` | Assigned Provider ID. |
| category_id | INT | `jobs.skill_id` | Service Category ID. |
| category_name | TEXT | `categories.name` | Name of the service. |
| booking_status | VARCHAR | `jobs.job_status` | pending, accepted, in_progress, completed. |
| payment_status | TEXT | Computed | paid, pending, refunded. |
| price | FLOAT | `jobs.final_price` | Final agreed amount. |
| service_date | TIMESTAMP | `jobs.scheduled_at` | Scheduled date/time. |

### **payments** (View)
*View over `transactions` table.*

| Column | Type | Source | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | `transactions.transaction_id` | unique Payment ID. |
| booking_id | UUID | `transactions.job_id` | Linked Job ID. |
| amount | FLOAT | `transactions.amount` | Transaction value. |
| status | VARCHAR | `transactions.transaction_status` | success, failed, pending. |
| payment_method | TEXT | Default: 'other' | card, upi, wallet. |

---

## 4. ADMIN & MODERATION TABLES

### **verification_requests** (Table)
*Queue for worker KYC validation.*

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Unique Request ID. |
| worker_id | UUID | NOT NULL | Worker submitting docs. |
| request_type | TEXT | Default: 'initial' | initial_verification. |
| status | TEXT | Default: 'pending' | pending, approved, rejected. |
| documents | JSONB | Default: '[]' | URLs of uploaded proofs. |
| reviewed_by | UUID | FK -> admins(id) | Admin who processed it. |

### **payment_disputes** (Table)
*Tracks conflicts between users and workers.*

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Unique Dispute ID. |
| booking_id | UUID | FK -> bookings(id) | The job in question. |
| raised_by | UUID | | User/Worker ID who complained. |
| amount_disputed | NUMERIC | | Amount in contention. |
| status | TEXT | Default: 'open' | open, resolved. |
| resolution | TEXT | | Outcome notes. |

### **system_settings** (Table)
*Dynamic application configuration.*

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **key** | TEXT | PK | Setting name (e.g., 'site_name'). |
| value | JSONB | NOT NULL | Setting value. |
| is_public | BOOLEAN | Default: FALSE | Exposed to API? |

### **audit_logs** (Table)
*System-wide event tracking.*

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Renamed from `audit_log_id`. |
| admin_id | UUID | FK -> admins(id) | Admin who performed action. |
| action_type | VARCHAR(50) | NOT NULL | login, update, delete. |
| target_type | VARCHAR(50) | | user, job, system. |
| description | TEXT | | Readable log message. |

---

## 5. REVIEWS & REPORTS

### **reviews** (View)
*View over `ratings` table.*

| Column | Type | Source | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | `ratings.rating_id` | Unique Review ID. |
| booking_id | UUID | `ratings.job_id` | Linked Job. |
| rating | INT | `ratings.rating_value` | 1-5 Stars. |
| comment | TEXT | `ratings.review_text` | User feedback. |

### **reports** (Table)
*General moderation tickets.*

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Unique Report ID. |
| reporter_id | UUID | NOT NULL | User reporting the issue. |
| report_type | TEXT | NOT NULL | abuse, scam, bug. |
| description | TEXT | NOT NULL | Details of the report. |
| status | TEXT | Default: 'open' | open, resolved, dismissed. |

---

## 6. ANALYTICS & ALERTS

### **daily_statistics** (Table)
*Cached metrics for dashboard charts.*

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Unique Stat ID. |
| date | DATE | UNIQUE | The date of the stats. |
| total_bookings | INT | | New jobs count. |
| revenue | NUMERIC | | Total GMV. |

### **admin_notifications** (Table)
*In-app alerts for admins.*

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | UUID | PK | Unique Notification ID. |
| title | TEXT | NOT NULL | Alert headline. |
| priority | TEXT | Default: 'normal' | low, high, critical. |
| is_read | BOOLEAN | Default: FALSE | Read status. |
