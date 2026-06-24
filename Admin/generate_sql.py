
import uuid
import random
from datetime import datetime, timedelta

# ==========================================
# CONFIGURATION
# ==========================================
NUM_USERS = 80
NUM_WORKERS = 50
NUM_BOOKINGS = 800
NUM_REPORTS = 40
NUM_NOTIFICATIONS = 100
NUM_DAILY_STATS = 180  # Past 180 days as requested

# Indian Context Data
INDIAN_NAMES_FIRST = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Reyansh', 'Vivaan', 'Diya', 'Ananya', 'Saanvi', 'Aadhya', 'Kiara', 'Pari', 'Rahul', 'Ishaan', 'Rohan', 'Priya', 'Neha', 'Suresh', 'Ramesh']
INDIAN_NAMES_LAST = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhatia', 'Patel', 'Mehta', 'Shah', 'Singh', 'Kumar', 'Das', 'Reddy', 'Nair', 'Rao', 'Iyer', 'Joshi', 'Desai', 'Jain']
CITIES = [
    ('Mumbai', 'Maharashtra'), ('Delhi', 'Delhi'), ('Bangalore', 'Karnataka'), 
    ('Hyderabad', 'Telangana'), ('Chennai', 'Tamil Nadu'), ('Pune', 'Maharashtra')
]

CATEGORIES = [
    (str(uuid.uuid4()), 'Plumbing', 'wrench', 350.00),
    (str(uuid.uuid4()), 'Electrical', 'zap', 400.00),
    (str(uuid.uuid4()), 'Cleaning', 'sparkles', 250.00),
    (str(uuid.uuid4()), 'Gardening', 'sprout', 300.00),
    (str(uuid.uuid4()), 'Carpentry', 'hammer', 450.00),
    (str(uuid.uuid4()), 'Painting', 'palette', 350.00),
    (str(uuid.uuid4()), 'Pest Control', 'bug', 500.00),
]

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def sql_val(val):
    if val is None: return "NULL"
    if isinstance(val, bool): return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)): return str(val)
    return f"'{str(val).replace("'", "''")}'"

def text_arr(arr):
    if not arr: return "'{}'"
    # Formats array as '{val1,val2}'
    inner = ",".join([f'"{str(s)}"' for s in arr])
    return f"\'{{{inner}}}\'"

def random_phone():
    return f"+91{random.randint(6000000000, 9999999999)}"

# ==========================================
# MAIN GENERATOR
# ==========================================
def generate_strict_sql():
    print("-- ==========================================")
    print("-- JOBKARI MVP DUMMY DATA (STRICT MODE)")
    print(f"-- Generated at: {datetime.now()}")
    print("-- ==========================================\n")
    
    print("BEGIN;")

    # 0. PREP & CLEANUP
    print("\n-- 0. PREP: RLS & Cleanup")
    tables_to_truncate = [
        'transaction_logs', 'user_device_tokens', 'worker_device_tokens', 'promo_codes', 
        'admin_notifications', 'reports', 'reviews', 'payments', 'bookings', 
        'portfolio_items', 'verification_documents', 'worker_availability', 
        'worker_categories', 'workers', 'addresses', 'users', 'categories', 'daily_statistics', 'admins'
    ]
    print(f"TRUNCATE TABLE {', '.join(['public.' + t for t in tables_to_truncate])} RESTART IDENTITY CASCADE;")

    # RLS Relaxation
    rls_tables = ['users', 'workers', 'bookings', 'payments', 'reviews', 'reports', 'worker_categories', 'categories', 'daily_statistics']
    for t in rls_tables:
        print(f"ALTER TABLE public.{t} ENABLE ROW LEVEL SECURITY;")
        print(f"DROP POLICY IF EXISTS \"Public read access for {t}\" ON public.{t};")
        print(f"CREATE POLICY \"Public read access for {t}\" ON public.{t} FOR SELECT USING (true);")

    # 1. CATEGORIES
    print("\n-- 1. CATEGORIES")
    print("INSERT INTO public.categories (id, name, description, icon, base_rate, is_active) VALUES")
    cat_rows = []
    for c in CATEGORIES:
        cat_rows.append(f"({sql_val(c[0])}, {sql_val(c[1])}, 'Professional {c[1]} Services', {sql_val(c[2])}, {c[3]}, TRUE)")
    print(",\n".join(cat_rows) + ";")

    # 2. USERS
    print("\n-- 2. USERS")
    print("INSERT INTO public.users (id, name, email, phone, status, wallet_balance, created_at) VALUES")
    users = []
    for i in range(NUM_USERS):
        uid = str(uuid.uuid4())
        fname = random.choice(INDIAN_NAMES_FIRST)
        lname = random.choice(INDIAN_NAMES_LAST)
        name = f"{fname} {lname}"
        users.append({'id': uid, 'name': name})
        
        email = f"user.{fname.lower()}{i}@example.com"
        created_at = datetime.now() - timedelta(days=random.randint(1, 180))
        
        users_line = f"({sql_val(uid)}, {sql_val(name)}, {sql_val(email)}, {sql_val(random_phone())}, 'active', {random.randint(0, 2000)}, {sql_val(created_at)})"
        # We perform print in chunks if list is too huge, but 50-100 is fine
        if i == NUM_USERS - 1: print(users_line + ";")
        else: print(users_line + ",")

    # 3. ADDRESSES (1 per User)
    print("\n-- 3. ADDRESSES")
    print("INSERT INTO public.addresses (id, user_id, label, address_text, city, district, pin, is_default) VALUES")
    addr_rows = []
    for i, u in enumerate(users):
        aid = str(uuid.uuid4())
        city_info = random.choice(CITIES)
        addr_text = f"{random.randint(1, 99)}, {random.choice(['Main Road', 'Park Street', 'Gandhi Nagar', 'Civil Lines'])}, Sector {random.randint(1, 20)}"
        pin = str(random.randint(110001, 800000))
        addr_rows.append(f"({sql_val(aid)}, {sql_val(u['id'])}, 'Home', {sql_val(addr_text)}, {sql_val(city_info[0])}, {sql_val(city_info[1])}, {sql_val(pin)}, TRUE)")
    print(",\n".join(addr_rows) + ";")

    # 4. WORKERS
    print("\n-- 4. WORKERS")
    print("INSERT INTO public.workers (id, name, email, phone, experience_years, hourly_rate, day_rate, bio, verification_status, status, is_available, total_jobs_completed, average_rating, created_at) VALUES")
    workers = []
    for i in range(NUM_WORKERS):
        wid = str(uuid.uuid4())
        fname = random.choice(INDIAN_NAMES_FIRST)
        lname = random.choice(INDIAN_NAMES_LAST)
        name = f"{fname} {lname}"
        
        # Requirements: hourly 150-400, day 800-2500, exp 1-25
        hourly = random.randint(150, 400)
        day = random.randint(800, 2500)
        exp = random.randint(1, 25)
        
        # Status distribution
        rand_stat = random.random()
        if rand_stat < 0.7: v_stat, stat, avail = 'approved', 'active', True
        elif rand_stat < 0.9: v_stat, stat, avail = 'pending', 'active', False
        else: v_stat, stat, avail = 'rejected', 'suspended', False
        
        # Rating 3.5 - 5.0
        rating = round(random.uniform(3.5, 5.0), 2)
        completed = random.randint(0, 150) if v_stat == 'approved' else 0
        
        workers.append({'id': wid, 'name': name, 'status': stat})
        
        line = f"({sql_val(wid)}, {sql_val(name)}, 'worker{i}@jobkari.com', {sql_val(random_phone())}, {exp}, {hourly}, {day}, 'Expert service provider', {sql_val(v_stat)}, {sql_val(stat)}, {sql_val(avail)}, {completed}, {rating}, {sql_val(datetime.now() - timedelta(days=random.randint(30, 180)))})"
        if i == NUM_WORKERS - 1: print(line + ";")
        else: print(line + ",")

    # 5. WORKER CATEGORIES (1-3 per worker)
    print("\n-- 5. WORKER ASSOCIATIONS (Categories, Availability, Docs)")
    wc_rows, wa_rows, vd_rows = [], [], []
    for w in workers:
        # Categories
        num_cats = random.randint(1, 3)
        my_cats = random.sample(CATEGORIES, num_cats)
        for idx, c in enumerate(my_cats):
            wc_rows.append(f"({sql_val(w['id'])}, {sql_val(c[0])}, {sql_val(idx==0)})")
        
        # Availability (Simple: Mon-Fri 9-5)
        for day in range(1, 6): # 1=Mon, 5=Fri
            wa_rows.append(f"({sql_val(w['id'])}, {day}, '09:00:00', '17:00:00', TRUE)")

        # Verification Docs
        vd_rows.append(f"({sql_val(w['id'])}, 'aadhar', 'XXXX-XXXX-{random.randint(1000,9999)}', 'https://example.com/doc1.jpg', 'approved', {sql_val(datetime.now())})")

    print("INSERT INTO public.worker_categories (worker_id, category_id, is_primary) VALUES \n" + ",\n".join(wc_rows) + ";")
    print("INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time, is_available) VALUES \n" + ",\n".join(wa_rows) + ";")
    print("INSERT INTO public.verification_documents (worker_id, document_type, document_number, document_url, verification_status, verified_at) VALUES \n" + ",\n".join(vd_rows) + ";")

    # 6. BOOKINGS, PAYMENTS, REVIEWS
    print("\n-- 6. BOOKINGS & LINKED DATA")
    bookings_lines = []
    payments_lines = []
    reviews_lines = []
    
    # Pre-generate bookings linked to users/workers
    valid_workers = [w for w in workers if w['status'] == 'active']
    
    for i in range(NUM_BOOKINGS):
        bid = str(uuid.uuid4())
        u = random.choice(users)
        w = random.choice(valid_workers)
        cat = random.choice(CATEGORIES)
        
        # Booking Status
        # 50% Completed, 20% Pending, 10% In Progress, 10% Cancelled, 10% Accepted
        rand_s = random.random()
        if rand_s < 0.5: status = 'completed'
        elif rand_s < 0.7: status = 'pending'
        elif rand_s < 0.8: status = 'in_progress'
        elif rand_s < 0.9: status = 'cancelled'
        else: status = 'accepted'
        
        # Dates (Past 180 days)
        date_offset = random.randint(0, 180)
        svc_date = datetime.now() - timedelta(days=date_offset)
        created_at = svc_date - timedelta(days=2)
        
        amount = float(random.randint(300, 2500))
        
        # Payment Status Logic
        pay_status = 'pending'
        if status == 'completed': pay_status = 'paid'
        elif status == 'cancelled' and random.random() > 0.5: pay_status = 'refunded'
        elif status == 'in_progress': pay_status = 'paid' # Pre-paid often
        
        # 1. Booking Line
        bookings_lines.append(f"({sql_val(bid)}, {sql_val(u['id'])}, {sql_val(w['id'])}, {sql_val(cat[0])}, {sql_val(cat[1])}, {sql_val(svc_date.date())}, '10:00:00', {random.randint(1, 8)}, {amount}, {sql_val(status)}, {sql_val(pay_status)}, {sql_val(created_at)})")
        
        # 2. Payment Line (If paid or refunded)
        if pay_status in ['paid', 'refunded', 'success']:
            pid = str(uuid.uuid4())
            method = random.choice(['upi', 'card', 'cod'])
            ref_id = f"pay_{uuid.uuid4().hex[:8]}"
            p_status = 'success' if pay_status == 'paid' else 'refunded'
            payments_lines.append(f"({sql_val(pid)}, {sql_val(bid)}, {sql_val(u['id'])}, {sql_val(w['id'])}, {amount}, {sql_val(method)}, {sql_val(ref_id)}, {sql_val(p_status)}, {sql_val(created_at)})")
            
        # 3. Review Line (Only if completed)
        if status == 'completed':
            rid = str(uuid.uuid4())
            rating = random.choice([3, 4, 5, 5, 5, 4, 2])
            comment = random.choice(['Excellent work', 'Good job', 'On time', 'Professional', 'Could be better'])
            reviews_lines.append(f"({sql_val(rid)}, {sql_val(bid)}, {sql_val(u['id'])}, {sql_val(w['id'])}, {rating}, {sql_val(comment)}, TRUE, {sql_val(svc_date + timedelta(days=1))})")

    print("INSERT INTO public.bookings (id, user_id, worker_id, category_id, category_name, service_date, start_time, duration_hours, price, booking_status, payment_status, created_at) VALUES")
    print(",\n".join(bookings_lines) + ";")
    
    if payments_lines:
        print("\nINSERT INTO public.payments (id, booking_id, user_id, worker_id, amount, payment_method, gateway_reference, status, created_at) VALUES")
        print(",\n".join(payments_lines) + ";")

    if reviews_lines:
        print("\nINSERT INTO public.reviews (id, booking_id, user_id, worker_id, rating, comment, is_public, created_at) VALUES")
        print(",\n".join(reviews_lines) + ";")

    # 7. REPORTS (Linked to bookings)
    print("\n-- 7. REPORTS")
    print("INSERT INTO public.reports (reporter_id, reporter_type, reported_id, reported_type, report_type, description, priority, status) VALUES")
    report_rows = []
    # Generate some reports
    for i in range(NUM_REPORTS):
        u = random.choice(users)
        w = random.choice(valid_workers)
        r_type = random.choice(['no_show', 'poor_quality', 'inappropriate_behavior'])
        report_rows.append(f"({sql_val(u['id'])}, 'user', {sql_val(w['id'])}, 'worker', {sql_val(r_type)}, 'Issue reported by user', 'medium', 'open')")
    print(",\n".join(report_rows) + ";")

    # 8. DAILY STATISTICS (Graph Data)
    print("\n-- 8. DAILY STATISTICS (For Graphs)")
    # Ensure Table Exists
    print("""
    CREATE TABLE IF NOT EXISTS public.daily_statistics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        date DATE UNIQUE,
        new_workers INTEGER DEFAULT 0,
        new_users INTEGER DEFAULT 0,
        total_bookings INTEGER DEFAULT 0,
        total_revenue NUMERIC(10, 2) DEFAULT 0,
        worker_earnings NUMERIC(10, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """)
    print("INSERT INTO public.daily_statistics (date, new_workers, new_users, total_bookings, total_revenue) VALUES")
    stats_rows = []
    for i in range(NUM_DAILY_STATS):
        dt = datetime.now().date() - timedelta(days=i)
        # Random realistic growth capability
        rev = random.randint(2000, 25000)
        bk = random.randint(5, 50)
        nw = random.randint(0, 2)
        nu = random.randint(1, 5)
        stats_rows.append(f"({sql_val(dt)}, {nw}, {nu}, {bk}, {rev})")
    print(",\n".join(stats_rows) + ";")

    print("COMMIT;")

if __name__ == "__main__":
    generate_strict_sql()

