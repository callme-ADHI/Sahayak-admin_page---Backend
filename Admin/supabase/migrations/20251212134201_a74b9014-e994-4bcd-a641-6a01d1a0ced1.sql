-- =====================================================================
-- JOBKARO ADMIN DASHBOARD - COMPLETE SCHEMA
-- Migration 1: Core Tables (Users, Workers, Categories, Bookings)
-- =====================================================================

-- Drop existing tables to recreate with proper schema
DROP TABLE IF EXISTS worker_payout_requests CASCADE;
DROP TABLE IF EXISTS worker_earnings CASCADE;
DROP TABLE IF EXISTS worker_bank_accounts CASCADE;
DROP TABLE IF EXISTS worker_certifications CASCADE;
DROP TABLE IF EXISTS worker_blocked_users CASCADE;
DROP TABLE IF EXISTS worker_working_areas CASCADE;
DROP TABLE IF EXISTS worker_notifications CASCADE;
DROP TABLE IF EXISTS worker_device_tokens CASCADE;
DROP TABLE IF EXISTS portfolio_items CASCADE;
DROP TABLE IF EXISTS worker_availability_exceptions CASCADE;
DROP TABLE IF EXISTS worker_availability CASCADE;
DROP TABLE IF EXISTS promo_code_usage CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_threads CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payment_disputes CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS verification_requests CASCADE;
DROP TABLE IF EXISTS verification_documents CASCADE;
DROP TABLE IF EXISTS worker_categories CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS user_wallet_transactions CASCADE;
DROP TABLE IF EXISTS user_device_tokens CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP TABLE IF EXISTS category_fields CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS daily_statistics CASCADE;
DROP TABLE IF EXISTS analytics_metrics CASCADE;
DROP TABLE IF EXISTS transaction_logs CASCADE;
DROP TABLE IF EXISTS platform_fees CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS admin_notifications CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS banned_entities CASCADE;
DROP TABLE IF EXISTS app_versions CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- =====================================================================
-- CATEGORIES TABLE
-- =====================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    base_rate NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories manageable by authenticated" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- CATEGORY FIELDS TABLE
-- =====================================================================
CREATE TABLE category_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'select', 'multiselect', 'date', 'time', 'textarea', 'file')),
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE category_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Category fields viewable by everyone" ON category_fields FOR SELECT USING (true);
CREATE POLICY "Category fields manageable by authenticated" ON category_fields FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- USERS TABLE
-- =====================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    profile_photo TEXT,
    public_bio TEXT,
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00 CHECK (wallet_balance >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active TIMESTAMPTZ
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users viewable by authenticated" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = auth_user_id);

-- =====================================================================
-- ADDRESSES TABLE
-- =====================================================================
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    address_text TEXT NOT NULL,
    city TEXT,
    district TEXT,
    pin TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Addresses viewable by authenticated" ON addresses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Addresses manageable by authenticated" ON addresses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- USER DEVICE TOKENS
-- =====================================================================
CREATE TABLE user_device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used TIMESTAMPTZ
);

ALTER TABLE user_device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Device tokens manageable by authenticated" ON user_device_tokens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- USER WALLET TRANSACTIONS
-- =====================================================================
CREATE TABLE user_wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'refund', 'bonus')),
    reference_type TEXT CHECK (reference_type IN ('booking', 'refund', 'topup', 'bonus', 'adjustment')),
    reference_id UUID,
    balance_before NUMERIC(10, 2) NOT NULL,
    balance_after NUMERIC(10, 2) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wallet transactions viewable by authenticated" ON user_wallet_transactions FOR SELECT TO authenticated USING (true);

-- =====================================================================
-- USER NOTIFICATIONS
-- =====================================================================
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User notifications viewable by authenticated" ON user_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "User notifications manageable by authenticated" ON user_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- PROMO CODES
-- =====================================================================
CREATE TABLE promo_codes (
    code TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percentage')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    max_discount_amount NUMERIC(10, 2),
    min_booking_amount NUMERIC(10, 2),
    max_usage INTEGER,
    usage_count INTEGER DEFAULT 0,
    max_usage_per_user INTEGER DEFAULT 1,
    applicable_categories UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promo codes viewable by authenticated" ON promo_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Promo codes manageable by authenticated" ON promo_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- WORKERS TABLE
-- =====================================================================
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    profile_photo TEXT,
    experience_years INTEGER DEFAULT 0 CHECK (experience_years >= 0),
    hourly_rate NUMERIC(10, 2) CHECK (hourly_rate >= 0),
    day_rate NUMERIC(10, 2) CHECK (day_rate >= 0),
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    bio TEXT,
    average_rating NUMERIC(3, 2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
    rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
    total_jobs_completed INTEGER DEFAULT 0 CHECK (total_jobs_completed >= 0),
    is_verified BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
    is_available BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active TIMESTAMPTZ,
    verified_at TIMESTAMPTZ
);

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers viewable by everyone" ON workers FOR SELECT USING (true);
CREATE POLICY "Workers can insert own profile" ON workers FOR INSERT TO authenticated WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "Workers can update own profile" ON workers FOR UPDATE TO authenticated USING (auth.uid() = auth_user_id);

-- =====================================================================
-- WORKER CATEGORIES
-- =====================================================================
CREATE TABLE worker_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    years_experience INTEGER DEFAULT 0,
    rate_override NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(worker_id, category_id)
);

ALTER TABLE worker_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker categories viewable by everyone" ON worker_categories FOR SELECT USING (true);
CREATE POLICY "Worker categories manageable by authenticated" ON worker_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- WORKER AVAILABILITY
-- =====================================================================
CREATE TABLE worker_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(worker_id, day_of_week)
);

ALTER TABLE worker_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker availability viewable by everyone" ON worker_availability FOR SELECT USING (true);
CREATE POLICY "Worker availability manageable by authenticated" ON worker_availability FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- WORKER AVAILABILITY EXCEPTIONS
-- =====================================================================
CREATE TABLE worker_availability_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(worker_id, exception_date)
);

ALTER TABLE worker_availability_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker availability exceptions viewable by authenticated" ON worker_availability_exceptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Worker availability exceptions manageable by authenticated" ON worker_availability_exceptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- VERIFICATION DOCUMENTS
-- =====================================================================
CREATE TABLE verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('aadhar', 'pan', 'driving_license', 'voter_id', 'passport', 'police_verification', 'other')),
    document_number TEXT,
    document_url TEXT NOT NULL,
    front_image_url TEXT,
    back_image_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    admin_notes TEXT,
    expiry_date DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verification docs viewable by authenticated" ON verification_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Verification docs manageable by authenticated" ON verification_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- PORTFOLIO ITEMS
-- =====================================================================
CREATE TABLE portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio items viewable by everyone" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Portfolio items manageable by authenticated" ON portfolio_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- WORKER DEVICE TOKENS
-- =====================================================================
CREATE TABLE worker_device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used TIMESTAMPTZ
);

ALTER TABLE worker_device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker device tokens manageable by authenticated" ON worker_device_tokens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- WORKER NOTIFICATIONS
-- =====================================================================
CREATE TABLE worker_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE worker_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker notifications viewable by authenticated" ON worker_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Worker notifications manageable by authenticated" ON worker_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- WORKER WORKING AREAS
-- =====================================================================
CREATE TABLE worker_working_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    area_name TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    pin_codes TEXT[] DEFAULT '{}',
    radius_km INTEGER,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE worker_working_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker areas viewable by everyone" ON worker_working_areas FOR SELECT USING (true);
CREATE POLICY "Worker areas manageable by authenticated" ON worker_working_areas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- WORKER BLOCKED USERS
-- =====================================================================
CREATE TABLE worker_blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(worker_id, blocked_user_id)
);

ALTER TABLE worker_blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker blocked users manageable by authenticated" ON worker_blocked_users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- WORKER CERTIFICATIONS
-- =====================================================================
CREATE TABLE worker_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    certification_name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    certificate_number TEXT,
    issue_date DATE,
    expiry_date DATE,
    certificate_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE worker_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker certifications viewable by everyone" ON worker_certifications FOR SELECT USING (true);
CREATE POLICY "Worker certifications manageable by authenticated" ON worker_certifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- WORKER BANK ACCOUNTS
-- =====================================================================
CREATE TABLE worker_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    account_holder_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    branch_name TEXT,
    account_type TEXT CHECK (account_type IN ('savings', 'current')),
    is_verified BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE worker_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker bank accounts viewable by authenticated" ON worker_bank_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Worker bank accounts manageable by authenticated" ON worker_bank_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- BOOKINGS TABLE
-- =====================================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    worker_id UUID REFERENCES workers(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    category_name TEXT NOT NULL,
    service_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_hours NUMERIC(4, 2) NOT NULL,
    job_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    job_details JSONB NOT NULL DEFAULT '{}',
    price NUMERIC(10, 2) NOT NULL,
    tip NUMERIC(10, 2) DEFAULT 0,
    booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bookings viewable by authenticated" ON bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Bookings manageable by authenticated" ON bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- PAYMENTS TABLE
-- =====================================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    worker_id UUID REFERENCES workers(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('wallet', 'upi', 'card', 'netbanking', 'cod', 'other')),
    gateway_reference TEXT,
    gateway_response JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded', 'partially_refunded')),
    refund_amount NUMERIC(10, 2) DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments viewable by authenticated" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Payments manageable by authenticated" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- WORKER EARNINGS
-- =====================================================================
CREATE TABLE worker_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    gross_amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) DEFAULT 0,
    net_amount NUMERIC(10, 2) NOT NULL,
    payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed', 'on_hold')),
    payout_date TIMESTAMPTZ,
    payout_reference TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE worker_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker earnings viewable by authenticated" ON worker_earnings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Worker earnings manageable by authenticated" ON worker_earnings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- WORKER PAYOUT REQUESTS
-- =====================================================================
CREATE TABLE worker_payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    bank_account_id UUID NOT NULL REFERENCES worker_bank_accounts(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'failed')),
    processed_by UUID,
    processed_at TIMESTAMPTZ,
    transaction_reference TEXT,
    rejection_reason TEXT,
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE worker_payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Worker payout requests viewable by authenticated" ON worker_payout_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Worker payout requests manageable by authenticated" ON worker_payout_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- REVIEWS TABLE
-- =====================================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT true,
    is_flagged BOOLEAN DEFAULT false,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviews manageable by authenticated" ON reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- CHAT THREADS
-- =====================================================================
CREATE TABLE chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, worker_id, booking_id)
);

ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat threads viewable by authenticated" ON chat_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Chat threads manageable by authenticated" ON chat_threads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- MESSAGES
-- =====================================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'worker')),
    receiver_id UUID NOT NULL,
    receiver_type TEXT NOT NULL CHECK (receiver_type IN ('user', 'worker')),
    message_text TEXT,
    attachment_url TEXT,
    attachment_type TEXT CHECK (attachment_type IN ('image', 'document', 'audio', 'video', 'location')),
    attachment_metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages viewable by authenticated" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Messages manageable by authenticated" ON messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- PROMO CODE USAGE
-- =====================================================================
CREATE TABLE promo_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code TEXT NOT NULL REFERENCES promo_codes(code) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    discount_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(promo_code, user_id, booking_id)
);

ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promo usage viewable by authenticated" ON promo_code_usage FOR SELECT TO authenticated USING (true);

-- =====================================================================
-- ADMINS TABLE
-- =====================================================================
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'verifier', 'support', 'finance', 'operations')),
    permissions JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMPTZ,
    last_login_ip TEXT,
    is_2fa_enabled BOOLEAN DEFAULT false,
    profile_photo TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES admins(id) ON DELETE SET NULL
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins viewable by authenticated" ON admins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manageable by authenticated" ON admins FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- ROLES TABLE
-- =====================================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles viewable by authenticated" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Roles manageable by authenticated" ON roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- ADMIN ROLES MAPPING
-- =====================================================================
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(admin_id, role_id)
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin roles viewable by authenticated" ON admin_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin roles manageable by authenticated" ON admin_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- AUDIT LOGS
-- =====================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    description TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    before_data JSONB,
    after_data JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs viewable by authenticated" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Audit logs insertable by authenticated" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================================
-- REPORTS / COMPLAINTS
-- =====================================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL,
    reporter_type TEXT NOT NULL CHECK (reporter_type IN ('user', 'worker', 'admin')),
    reported_id UUID NOT NULL,
    reported_type TEXT NOT NULL CHECK (reported_type IN ('user', 'worker', 'booking')),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('inappropriate_behavior', 'no_show', 'poor_quality', 'safety_concern', 'fraud', 'harassment', 'other')),
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
    assigned_to UUID REFERENCES admins(id) ON DELETE SET NULL,
    admin_notes TEXT,
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports viewable by authenticated" ON reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reports manageable by authenticated" ON reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- VERIFICATION REQUESTS
-- =====================================================================
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('initial_verification', 'document_resubmission', 'reverification')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    documents_submitted JSONB NOT NULL DEFAULT '[]',
    reviewed_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verification requests viewable by authenticated" ON verification_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Verification requests manageable by authenticated" ON verification_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- ADMIN NOTIFICATIONS
-- =====================================================================
CREATE TABLE admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    action_url TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin notifications viewable by authenticated" ON admin_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin notifications manageable by authenticated" ON admin_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- SYSTEM SETTINGS
-- =====================================================================
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    is_editable BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System settings viewable by authenticated" ON system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "System settings manageable by authenticated" ON system_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- PLATFORM FEES
-- =====================================================================
CREATE TABLE platform_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    fee_type TEXT NOT NULL CHECK (fee_type IN ('percentage', 'flat', 'hybrid')),
    percentage_fee NUMERIC(5, 2) CHECK (percentage_fee >= 0 AND percentage_fee <= 100),
    flat_fee NUMERIC(10, 2) CHECK (flat_fee >= 0),
    min_fee NUMERIC(10, 2),
    max_fee NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_until TIMESTAMPTZ,
    created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE platform_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform fees viewable by authenticated" ON platform_fees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Platform fees manageable by authenticated" ON platform_fees FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- TRANSACTION LOGS
-- =====================================================================
CREATE TABLE transaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transaction logs viewable by authenticated" ON transaction_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Transaction logs insertable by authenticated" ON transaction_logs FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================================
-- ANALYTICS METRICS
-- =====================================================================
CREATE TABLE analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL,
    metric_category TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    dimensions JSONB DEFAULT '{}',
    time_period TEXT NOT NULL CHECK (time_period IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(metric_type, time_period, period_start)
);

ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analytics metrics viewable by authenticated" ON analytics_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analytics metrics manageable by authenticated" ON analytics_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- DAILY STATISTICS
-- =====================================================================
CREATE TABLE daily_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    pending_bookings INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    new_workers INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    active_workers INTEGER DEFAULT 0,
    total_revenue NUMERIC(12, 2) DEFAULT 0,
    platform_revenue NUMERIC(12, 2) DEFAULT 0,
    worker_earnings NUMERIC(12, 2) DEFAULT 0,
    average_booking_value NUMERIC(10, 2) DEFAULT 0,
    average_rating NUMERIC(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE daily_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily statistics viewable by authenticated" ON daily_statistics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Daily statistics manageable by authenticated" ON daily_statistics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- PAYMENT DISPUTES
-- =====================================================================
CREATE TABLE payment_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    raised_by UUID NOT NULL,
    raised_by_type TEXT NOT NULL CHECK (raised_by_type IN ('user', 'worker')),
    dispute_type TEXT NOT NULL CHECK (dispute_type IN ('service_not_provided', 'poor_quality', 'overcharge', 'unauthorized', 'duplicate', 'other')),
    amount_disputed NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'rejected')),
    resolution TEXT,
    refund_amount NUMERIC(10, 2) DEFAULT 0,
    assigned_to UUID REFERENCES admins(id) ON DELETE SET NULL,
    resolved_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payment disputes viewable by authenticated" ON payment_disputes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Payment disputes manageable by authenticated" ON payment_disputes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- ANNOUNCEMENTS
-- =====================================================================
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    announcement_type TEXT NOT NULL CHECK (announcement_type IN ('info', 'warning', 'update', 'maintenance', 'promotion')),
    target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'users', 'workers', 'admins')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    image_url TEXT,
    action_url TEXT,
    action_label TEXT,
    created_by UUID NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements viewable by authenticated" ON announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Announcements manageable by authenticated" ON announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- BANNED ENTITIES
-- =====================================================================
CREATE TABLE banned_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'worker', 'device', 'ip_address')),
    ban_type TEXT NOT NULL CHECK (ban_type IN ('temporary', 'permanent')),
    reason TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    banned_by UUID NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
    ban_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    lifted_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    lifted_at TIMESTAMPTZ,
    lift_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE banned_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banned entities viewable by authenticated" ON banned_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Banned entities manageable by authenticated" ON banned_entities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- APP VERSIONS
-- =====================================================================
CREATE TABLE app_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
    app_type TEXT NOT NULL CHECK (app_type IN ('user', 'worker')),
    version_number TEXT NOT NULL,
    version_code INTEGER NOT NULL,
    is_force_update BOOLEAN DEFAULT false,
    min_supported_version TEXT,
    release_notes TEXT,
    download_url TEXT,
    is_active BOOLEAN DEFAULT true,
    released_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    released_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(platform, app_type, version_number)
);

ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "App versions viewable by everyone" ON app_versions FOR SELECT USING (true);
CREATE POLICY "App versions manageable by authenticated" ON app_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================================
-- TRIGGER FUNCTION: Update updated_at
-- =====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_availability_updated_at BEFORE UPDATE ON worker_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verification_documents_updated_at BEFORE UPDATE ON verification_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_certifications_updated_at BEFORE UPDATE ON worker_certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_bank_accounts_updated_at BEFORE UPDATE ON worker_bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_earnings_updated_at BEFORE UPDATE ON worker_earnings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_payout_requests_updated_at BEFORE UPDATE ON worker_payout_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON verification_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_fees_updated_at BEFORE UPDATE ON platform_fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_statistics_updated_at BEFORE UPDATE ON daily_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_disputes_updated_at BEFORE UPDATE ON payment_disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banned_entities_updated_at BEFORE UPDATE ON banned_entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- TRIGGER FUNCTION: Update worker rating after review
-- =====================================================================
CREATE OR REPLACE FUNCTION update_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE workers
    SET 
        average_rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM reviews
            WHERE worker_id = NEW.worker_id
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE worker_id = NEW.worker_id
        )
    WHERE id = NEW.worker_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_worker_rating_after_review
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_worker_rating();

-- =====================================================================
-- TRIGGER FUNCTION: Increment completed jobs counter
-- =====================================================================
CREATE OR REPLACE FUNCTION increment_worker_completed_jobs()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_status = 'completed' AND (OLD.booking_status IS NULL OR OLD.booking_status != 'completed') THEN
        UPDATE workers
        SET total_jobs_completed = total_jobs_completed + 1
        WHERE id = NEW.worker_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER increment_completed_jobs_trigger
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION increment_worker_completed_jobs();

-- =====================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================================
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_display_order ON categories(display_order);
CREATE INDEX idx_category_fields_category_id ON category_fields(category_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_workers_phone ON workers(phone);
CREATE INDEX idx_workers_email ON workers(email);
CREATE INDEX idx_workers_status ON workers(status);
CREATE INDEX idx_workers_is_verified ON workers(is_verified);
CREATE INDEX idx_workers_verification_status ON workers(verification_status);
CREATE INDEX idx_workers_is_available ON workers(is_available);
CREATE INDEX idx_workers_rating ON workers(average_rating DESC);
CREATE INDEX idx_workers_skills ON workers USING GIN(skills);
CREATE INDEX idx_workers_created_at ON workers(created_at);
CREATE INDEX idx_worker_categories_worker_id ON worker_categories(worker_id);
CREATE INDEX idx_worker_categories_category_id ON worker_categories(category_id);
CREATE INDEX idx_verification_docs_worker_id ON verification_documents(worker_id);
CREATE INDEX idx_verification_docs_status ON verification_documents(verification_status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_worker_id ON bookings(worker_id);
CREATE INDEX idx_bookings_category_id ON bookings(category_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_service_date ON bookings(service_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_reviews_worker_id ON reviews(worker_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_status ON admins(status);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority ON reports(priority);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_admin_notifications_admin_id ON admin_notifications(admin_id);
CREATE INDEX idx_admin_notifications_is_read ON admin_notifications(admin_id, is_read);
CREATE INDEX idx_daily_statistics_date ON daily_statistics(date DESC);