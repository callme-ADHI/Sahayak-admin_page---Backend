// Mock Supabase client routing requests to Django backend
class MockQueryBuilder {
  table: string;
  filters: Record<string, any> = {};
  orderByField: string = '';
  ascending: boolean = true;
  limitCount: number = 0;
  updateData: any = null;
  insertData: any = null;
  singleRow: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string = '*') {
    return this;
  }

  order(field: string, options?: { ascending: boolean }) {
    this.orderByField = field;
    this.ascending = options?.ascending ?? true;
    return this;
  }

  eq(field: string, value: any) {
    this.filters[field] = value;
    return this;
  }

  gte(field: string, value: any) {
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  insert(data: any) {
    this.insertData = data;
    return this;
  }

  delete() {
    this.updateData = { action: 'delete' };
    return this;
  }

  maybeSingle() {
    this.singleRow = true;
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  async then(onfulfilled: (value: any) => any) {
    try {
      const data = await this.execute();
      return onfulfilled({ data, error: null });
    } catch (error: any) {
      console.error(`MockSupabase API Error on table ${this.table}:`, error);
      return onfulfilled({ data: null, error });
    }
  }

  async execute() {
    const BASE_URL = 'http://localhost:8000/api';
    
    let endpoint = '';
    if (this.table === 'users') endpoint = 'users/';
    else if (this.table === 'workers') endpoint = 'workers/';
    else if (this.table === 'bookings') endpoint = 'bookings/';
    else if (this.table === 'categories') endpoint = 'categories/';
    else if (this.table === 'payments') endpoint = 'payments/';
    else if (this.table === 'reports') endpoint = 'reports/';
    else if (this.table === 'admins') endpoint = 'admins/';
    else if (this.table === 'verification_requests' || this.table === 'verification_documents') {
      // Get all workers who are not verified
      const res = await fetch(`${BASE_URL}/workers/`);
      const workers = await res.json();
      return workers.map((w: any) => ({
        id: w.id,
        worker_id: w.id,
        status: w.verified ? 'approved' : 'pending',
        verification_status: w.verified ? 'approved' : 'pending',
        created_at: w.created_at
      }));
    }
    else if (this.table === 'roles') {
      return [
        { id: 'role-1', name: 'President', is_active: true, created_at: new Date().toISOString() },
        { id: 'role-2', name: 'Vice President', is_active: true, created_at: new Date().toISOString() },
        { id: 'role-3', name: 'Analytics', is_active: true, created_at: new Date().toISOString() }
      ];
    }
    else if (this.table === 'audit_logs') {
      return [
        { id: 'log-1', action_type: 'login', target_type: 'admin', description: 'Admin logged in', created_at: new Date().toISOString() }
      ];
    }
    else if (this.table === 'daily_statistics') {
      const mockStats = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        mockStats.push({
          id: `stat-${i}`,
          date: d.toISOString().split('T')[0],
          new_workers: 1 + Math.floor(Math.random() * 2),
          new_users: 2 + Math.floor(Math.random() * 4),
          total_bookings: 5 + Math.floor(Math.random() * 5),
          total_revenue: 1000 + Math.floor(Math.random() * 1000),
          worker_earnings: 800 + Math.floor(Math.random() * 800),
        });
      }
      return mockStats;
    }

    if (!endpoint) return [];

    let url = `${BASE_URL}/${endpoint}`;
    
    // GET requests
    if (!this.updateData && !this.insertData) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(this.filters)) {
        if (k === 'booking_status') params.append('status', v);
        else if (k === 'verification_status') params.append('verification_status', v);
        else params.append(k, v);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      let data = await res.json();

      if (this.table === 'workers' && this.filters['verification_status'] === 'pending') {
        data = data.filter((w: any) => !w.verified);
      }

      // Map field names to match what front-end expects
      if (this.table === 'workers') {
        data = data.map((w: any) => ({
          ...w,
          verification_status: w.verified ? 'approved' : 'pending',
          is_available: w.availability === 'Available'
        }));
      }

      if (this.table === 'bookings') {
        data = data.map((b: any) => ({
          ...b,
          booking_status: b.status
        }));
      }

      if (this.singleRow) {
        if (Array.isArray(data)) {
          return data[0] || null;
        }
        return data;
      }
      return data;
    }
    
    // POST/PUT/DELETE updates
    if (this.updateData) {
      const id = this.filters['id'] || this.filters['worker_id'] || this.filters['booking_id'];
      let payload: any = { id };
      
      if (this.table === 'users') {
        payload.status = this.updateData.status;
      } else if (this.table === 'workers') {
        if (this.updateData.verification_status === 'approved') {
          payload.action = 'approve';
        } else if (this.updateData.verification_status === 'rejected') {
          payload.action = 'reject';
        } else {
          payload.action = this.updateData.status === 'suspended' ? 'suspend' : 'reactivate';
        }
      } else if (this.table === 'bookings') {
        payload.status = this.updateData.booking_status;
      } else if (this.table === 'reports') {
        payload.status = this.updateData.status;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    }

    if (this.insertData) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.insertData)
      });
      return await res.json();
    }
  }
}

class MockSupabaseClient {
  from(table: string) {
    return new MockQueryBuilder(table);
  }
  auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  };
}

export const supabase = new MockSupabaseClient() as any;