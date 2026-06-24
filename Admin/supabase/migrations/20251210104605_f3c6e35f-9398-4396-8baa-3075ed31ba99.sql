-- =====================================================================
-- CORE TABLES MIGRATION - PART 1
-- Job Marketplace Platform - Categories, Users, Workers
-- =====================================================================

-- =====================================================================
-- CATEGORIES TABLE
-- Job categories (shared between users and workers)
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

COMMENT ON TABLE categories IS 'Job categories: Plumber, Electrician, Carpenter, etc.';

CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- =====================================================================
-- CATEGORY FIELDS TABLE
-- Dynamic field definitions for each category
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

COMMENT ON TABLE category_fields IS 'Dynamic form fields for each job category';

CREATE INDEX idx_category_fields_category_id ON category_fields(category_id);
CREATE INDEX idx_category_fields_order ON category_fields(category_id, display_order);

-- =====================================================================
-- USERS TABLE (Employers/Job Providers)
-- =====================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    profile_photo TEXT,
    public_bio TEXT,
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00 CHECK (wallet_balance >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active TIMESTAMPTZ
);

COMMENT ON TABLE users IS 'Main table for job providers/employers who hire workers';

CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

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

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_is_default ON addresses(user_id, is_default);

-- =====================================================================
-- WORKERS TABLE (Service Providers)
-- =====================================================================

CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
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

COMMENT ON TABLE workers IS 'Service providers/daily wage workers';

CREATE INDEX idx_workers_auth_user_id ON workers(auth_user_id);
CREATE INDEX idx_workers_phone ON workers(phone);
CREATE INDEX idx_workers_email ON workers(email);
CREATE INDEX idx_workers_status ON workers(status);
CREATE INDEX idx_workers_is_verified ON workers(is_verified);
CREATE INDEX idx_workers_verification_status ON workers(verification_status);
CREATE INDEX idx_workers_is_available ON workers(is_available);
CREATE INDEX idx_workers_rating ON workers(average_rating DESC);
CREATE INDEX idx_workers_skills ON workers USING GIN(skills);
CREATE INDEX idx_workers_created_at ON workers(created_at);

-- =====================================================================
-- WORKER CATEGORIES (Many-to-Many)
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

CREATE INDEX idx_worker_categories_worker_id ON worker_categories(worker_id);
CREATE INDEX idx_worker_categories_category_id ON worker_categories(category_id);
CREATE INDEX idx_worker_categories_primary ON worker_categories(worker_id, is_primary);

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

CREATE INDEX idx_verification_docs_worker_id ON verification_documents(worker_id);
CREATE INDEX idx_verification_docs_status ON verification_documents(verification_status);
CREATE INDEX idx_verification_docs_type ON verification_documents(document_type);

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

COMMENT ON TABLE bookings IS 'Job bookings/orders placed by users';

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_worker_id ON bookings(worker_id);
CREATE INDEX idx_bookings_category_id ON bookings(category_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_service_date ON bookings(service_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

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

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_worker_id ON payments(worker_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_gateway_reference ON payments(gateway_reference);

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

CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_worker_id ON reviews(worker_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- =====================================================================
-- Enable RLS on all tables
-- =====================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RLS Policies - Categories (Public Read)
-- =====================================================================

CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Categories are manageable by authenticated users" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================================
-- RLS Policies - Category Fields (Public Read)
-- =====================================================================

CREATE POLICY "Category fields are viewable by everyone" ON category_fields
    FOR SELECT USING (true);

CREATE POLICY "Category fields are manageable by authenticated users" ON category_fields
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================================
-- RLS Policies - Users
-- =====================================================================

CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- =====================================================================
-- RLS Policies - Addresses
-- =====================================================================

CREATE POLICY "Addresses viewable by authenticated users" ON addresses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Addresses manageable by authenticated users" ON addresses
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================================
-- RLS Policies - Workers
-- =====================================================================

CREATE POLICY "Workers viewable by everyone" ON workers
    FOR SELECT USING (true);

CREATE POLICY "Workers can insert their own profile" ON workers
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Workers can update their own profile" ON workers
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- =====================================================================
-- RLS Policies - Worker Categories
-- =====================================================================

CREATE POLICY "Worker categories viewable by everyone" ON worker_categories
    FOR SELECT USING (true);

CREATE POLICY "Worker categories manageable by authenticated" ON worker_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================================
-- RLS Policies - Verification Documents
-- =====================================================================

CREATE POLICY "Verification docs viewable by authenticated" ON verification_documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Verification docs manageable by authenticated" ON verification_documents
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================================
-- RLS Policies - Bookings
-- =====================================================================

CREATE POLICY "Bookings viewable by authenticated" ON bookings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Bookings manageable by authenticated" ON bookings
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================================
-- RLS Policies - Payments
-- =====================================================================

CREATE POLICY "Payments viewable by authenticated" ON payments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Payments manageable by authenticated" ON payments
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================================
-- RLS Policies - Reviews
-- =====================================================================

CREATE POLICY "Reviews viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Reviews manageable by authenticated" ON reviews
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================================
-- Trigger Functions
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_docs_updated_at BEFORE UPDATE ON verification_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- Function to update worker rating after new review
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_worker_rating_after_review
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_worker_rating();