-- =====================================================================
-- 1.sql - JOB KARO ADMIN COMPATIBILITY LAYER
-- Maps the "User SQL" schema to the "Repo Code" schema requirements.
-- =====================================================================

-- =====================================================================
-- 1. MISSING ADMIN TABLES
-- Examples: system_settings, admin_notifications, daily_statistics
-- =====================================================================

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    is_editable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,
    total_revenue NUMERIC(12, 2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL,
    report_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS banned_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 2. SCHEMA MAPPING (VIEWS & ADAPTERS)
-- Maps Repo 'bookings' -> User 'jobs'
-- =====================================================================

-- VIEW: bookings
-- Maps 'jobs' table to 'bookings' expected by the UI.
CREATE OR REPLACE VIEW bookings AS 
SELECT 
    j.job_id AS id,
    j.user_id,
    ja.worker_id, -- From job_assignments
    j.skill_id AS category_id,
    j.job_status AS booking_status,
    j.scheduled_at AS service_date,
    j.final_price AS price,
    j.address_id AS job_address_id,
    j.created_at,
    j.description AS notes
FROM jobs j
LEFT JOIN job_assignments ja ON j.job_id = ja.job_id;

-- VIEW: categories
-- Maps 'skills' table to 'categories' expected by the UI.
CREATE OR REPLACE VIEW categories AS
SELECT 
    skill_id AS id,
    skill_name AS name,
    description,
    is_active,
    created_at
FROM skills;

-- VIEW: workers
-- Maps 'worker_profiles' and 'users' to 'workers' expected by the UI.
-- Note: Requires joining users to get name/email.
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
    wp.bio,
    wp.experience_years
FROM worker_profiles wp
JOIN users u ON wp.user_id = u.user_id
LEFT JOIN user_profiles up ON u.user_id = up.user_id;

-- VIEW: reviews
-- Maps 'ratings' to 'reviews'
CREATE OR REPLACE VIEW reviews AS
SELECT
    rating_id AS id,
    job_id AS booking_id,
    from_user_id AS user_id,
    to_user_id AS worker_id,
    rating_value AS rating,
    review_text AS comment,
    created_at
FROM ratings
WHERE rating_type = 'job_review'; -- Assuming type

-- =====================================================================
-- 3. UTILITY FUNCTIONS (If needed)
-- =====================================================================

-- (Add any necessary triggers or RPCs here if the code relies on them)
