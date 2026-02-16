-- =====================================================================
-- 2.sql - ADVANCED MAPPING & MISSING TABLES
-- created to resolve console errors (404/400)
-- =====================================================================

-- =====================================================================
-- 1. ENHANCED VIEWS (Fixing Missing Columns)
-- =====================================================================

-- VIEW: bookings (Refined)
-- Added: category_name, payment_status, duration_hours, tip, cancellation_reason
DROP VIEW IF EXISTS bookings;
CREATE OR REPLACE VIEW bookings AS 
SELECT 
    j.job_id AS id,
    j.user_id,
    ja.worker_id,
    j.skill_id AS category_id,
    s.skill_name AS category_name,               -- Added: Join with skills
    j.job_status AS booking_status,
    -- Map job_status to payment_status loosely (can be improved with transactions join)
    CASE 
        WHEN j.job_status = 'completed' THEN 'paid'
        WHEN j.job_status = 'cancelled' THEN 'refunded'
        ELSE 'pending'
    END AS payment_status,
    j.scheduled_at AS service_date,
    j.scheduled_at::time AS start_time,          -- Cast timestamp to time
    2.0 AS duration_hours,                       -- Default mock value (missing in jobs)
    j.final_price AS price,
    0.0 AS tip,                                  -- Default mock value
    j.address_id AS job_address_id,
    '{}'::jsonb AS job_details,                  -- Default empty json
    j.cancellation_reason,                       -- Added from jobs
    NULL::uuid AS cancelled_by,                  -- Placeholder
    j.created_at,
    j.created_at AS updated_at,
    ja.accepted_at,
    ja.started_at,
    ja.completed_at,
    NULL::timestamp AS cancelled_at
FROM jobs j
LEFT JOIN job_assignments ja ON j.job_id = ja.job_id
LEFT JOIN skills s ON j.skill_id = s.skill_id;

-- VIEW: workers (Refined)
-- Added: verification_status, is_verified, skills array
DROP VIEW IF EXISTS workers;
CREATE OR REPLACE VIEW workers AS
SELECT 
    wp.user_id AS id,
    wp.user_id AS auth_user_id,
    up.full_name AS name,
    u.phone,
    u.email,
    wp.worker_status AS status,
    wp.is_available,
    wp.average_rating,
    wp.total_jobs_completed,
    wp.experience_years,
    wp.bio,
    -- Map boolean is_verified to enum status
    CASE 
        WHEN u.is_verified THEN 'approved'
        ELSE 'pending' 
    END AS verification_status,
    u.is_verified,
    ARRAY[]::text[] AS skills,                  -- Placeholder for array
    ARRAY[]::text[] AS languages,               -- Placeholder
    '{}'::jsonb AS metadata,
    u.created_at,
    u.created_at AS updated_at,
    u.last_login_at AS last_active,
    NULL::timestamp AS verified_at
FROM worker_profiles wp
JOIN users u ON wp.user_id = u.user_id
LEFT JOIN user_profiles up ON u.user_id = up.user_id;

-- VIEW: categories (Refined)
-- Added: display_order
DROP VIEW IF EXISTS categories;
CREATE OR REPLACE VIEW categories AS
SELECT 
    skill_id AS id,
    skill_name AS name,
    description,
    '' AS icon,                                 -- Placeholder
    0.0 AS base_rate,                           -- Placeholder
    is_active,
    skill_id AS display_order,                  -- Use ID as order
    '{}'::jsonb AS metadata,
    created_at,
    created_at AS updated_at
FROM skills;

-- VIEW: payments (Refined wrapper around transactions)
-- Helper view to map transactions -> payments
CREATE OR REPLACE VIEW payments AS
SELECT
    transaction_id AS id,
    job_id AS booking_id,
    from_user_id AS user_id,
    to_user_id AS worker_id,
    amount,
    'INR' AS currency,
    'other' AS payment_method,
    gateway_reference,
    NULL::jsonb AS gateway_response,
    transaction_status AS status,
    0.0 AS refund_amount,
    failure_reason AS refund_reason,
    NULL::timestamp AS refunded_at,
    '{}'::jsonb AS metadata,
    created_at,
    created_at AS updated_at
FROM transactions;

-- =====================================================================
-- 2. CREATE TRULY MISSING TABLES
-- =====================================================================

-- verification_requests (No equivalent in User SQL)
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL, -- Logical FK to workers(id)
    request_type TEXT NOT NULL DEFAULT 'initial_verification',
    status TEXT NOT NULL DEFAULT 'pending',
    documents_submitted JSONB DEFAULT '[]',
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- payment_disputes (No equivalent in User SQL)
CREATE TABLE IF NOT EXISTS payment_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID,
    booking_id UUID,
    raised_by UUID,
    raised_by_type TEXT,
    dispute_type TEXT,
    amount_disputed NUMERIC(10, 2),
    description TEXT,
    evidence_urls TEXT[],
    status TEXT DEFAULT 'open',
    resolution TEXT,
    refund_amount NUMERIC(10, 2),
    assigned_to UUID,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- worker_categories (Bridge table mock)
CREATE TABLE IF NOT EXISTS worker_categories_mock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID,
    category_id UUID,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- We use a view but also need a table for writes depending on how the app uses it
-- Keeping it simpler with just the view approach for now if the app only reads.
-- If the app writes to worker_categories, we need a real table or updateble view.
-- The User SQL "worker_skills" matches this. Let's View it.

CREATE OR REPLACE VIEW worker_categories AS
SELECT
    ws.worker_id,
    ws.skill_id AS category_id,
    NULL::uuid AS id, -- Composite key in user sql, generated here might be tricky
    TRUE AS is_primary, -- defaulting
    0 AS years_experience,
    ws.price_hint AS rate_override,
    ws.added_at AS created_at
FROM worker_skills ws;

-- audit_logs (View wrapper)
-- User SQL has audit_logs, but likely missing 'admin_id' or specific columns 
-- The user SQL audit_logs has: audit_log_id, event_type, related_entity_id, triggered_by
-- Repo expects: id, admin_id, action_type, target_type, target_id...
-- We basically rename columns.
CREATE OR REPLACE VIEW audit_logs_view AS -- Can't shadow existing table easily if it has same name
SELECT
    audit_log_id AS id,
    triggered_by AS admin_id,
    event_type AS action_type,
    related_entity_type AS target_type,
    related_entity_id AS target_id,
    event_description AS description,
    NULL::text AS ip_address,
    NULL::text AS user_agent,
    NULL::jsonb AS before_data,
    NULL::jsonb AS after_data,
    '{}'::jsonb AS metadata,
    created_at
FROM audit_logs;

-- NOTE: If the table "audit_logs" already exists in the standard schema, 
-- we can't replace it with a view of the same name. 
-- The user SQL creates "audit_logs" as a table.
-- The Repo Code Queries "audit_logs".
-- Check if User SQL "audit_logs" columns match Repo "audit_logs" columns.
-- They DO NOT match perfectly. 
-- User: event_type, related_entity_type
-- Repo: action_type, target_type
-- Solution: ALTER the User's table to add/rename columns to satisfy the Repo.

/*
ALTER TABLE audit_logs RENAME COLUMN event_type TO action_type;
ALTER TABLE audit_logs RENAME COLUMN related_entity_type TO target_type;
ALTER TABLE audit_logs RENAME COLUMN related_entity_id TO target_id;
ALTER TABLE audit_logs RENAME COLUMN event_description TO description;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES users(user_id);
-- ... permissions etc.
*/

