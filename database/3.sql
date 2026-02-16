-- =====================================================================
-- 3.sql - CRITICAL FIXES FOR COLUMN NAMES & RELATIONS
-- Resolves "column does not exist" and 404 errors for Admins/Roles
-- =====================================================================

-- =====================================================================
-- 1. FIX USER ID COLUMN MISMATCH
-- User SQL uses 'user_id', Code expects 'id'.
-- We rename the column to satisfy the frontend code.
-- =====================================================================
ALTER TABLE users RENAME COLUMN user_id TO id;

-- Also update references (if cascading didn't handle it automatically, 
-- but Postgres usually handles renames well).
-- We also need to fix other tables that use user_id as FK if logical naming matters,
-- but strictly speaking only the column name on the 'users' table itself needs 
-- to be 'id' for "select=id,status" to work.

-- =====================================================================
-- 2. FIX ROLES ID COLUMN MISMATCH
-- User SQL uses 'role_id', Code expects 'id'.
-- =====================================================================
ALTER TABLE roles RENAME COLUMN role_id TO id;

-- =====================================================================
-- 3. CREATE MISSING 'ADMINS' TABLE
-- The dashboard treats Admins as separate from Users.
-- =====================================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES users(id), -- Link to auth system
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active',
    last_login TIMESTAMPTZ,
    profile_photo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed a default admin so you can log in/test
INSERT INTO admins (name, email, role, status)
VALUES ('Admin User', 'admin@jobkaro.com', 'super_admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- =====================================================================
-- 4. FIX AUDIT LOGS RELATIONS
-- Code expects 'audit_logs' with 'admin_id' relation.
-- User SQL has 'audit_logs' with 'triggered_by' (FK to users).
-- =====================================================================

-- First, align column names
ALTER TABLE audit_logs RENAME COLUMN audit_log_id TO id;
ALTER TABLE audit_logs RENAME COLUMN event_type TO action_type;
ALTER TABLE audit_logs RENAME COLUMN related_entity_type TO target_type;
ALTER TABLE audit_logs RENAME COLUMN related_entity_id TO target_id;
ALTER TABLE audit_logs RENAME COLUMN event_description TO description;

-- Add admin_id for the relationship
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admins(id);

-- Define the relationship for Supabase PostgREST
-- (Supabase detects FKs. We just added one above.)

-- =====================================================================
-- 5. FIX CATEGORIES
-- User SQL: skills(skill_id) -> Code: categories(id)
-- 2.sql created a VIEW 'categories'. 
-- IF 'skills' table exists, we should rename its columns to match 
-- 'categories' logic directly to avoid View complexity with write ops.
-- =====================================================================
DROP VIEW IF EXISTS categories; -- Drop the view from 2.sql
ALTER TABLE skills RENAME TO categories;
ALTER TABLE categories RENAME COLUMN skill_id TO id;
ALTER TABLE categories RENAME COLUMN skill_name TO name;
-- Add missing columns expected by code
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS base_rate NUMERIC(10,2);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================================
-- 6. FIX USER_PROFILES -> USERS MAPPING
-- The code queries 'users' and expects profile data (name, avatar) there.
-- User SQL splits them. We need to merge them OR ensure 'users' has the cols.
-- =====================================================================
-- Add profile columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- (Optional) Sync data from user_profiles to users if data exists
UPDATE users u
SET name = up.full_name,
    profile_photo = up.profile_photo_url
FROM user_profiles up
WHERE u.id = up.user_id;

-- =====================================================================
-- 7. WORKER CATEGORIES RELATIONSHIP FIX
-- Code: workers?select=...,worker_categories(...)
-- We need a real table 'worker_categories' with FKs to 'workers' and 'categories'
-- =====================================================================
DROP VIEW IF EXISTS worker_categories; -- From 2.sql
CREATE TABLE IF NOT EXISTS worker_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL, -- We'll add FK constraint below
    category_id INTEGER NOT NULL references categories(id),
    is_primary BOOLEAN DEFAULT false,
    years_experience INTEGER DEFAULT 0,
    rate_override NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Note: User SQL 'worker_profiles' uses user_id (UUID) as PK.
-- The 'workers' view in 2.sql maps this.
-- But for relationships to work easily, we might need 'workers' to be a real table 
-- OR ensure FKs point to the base tables correctly.
