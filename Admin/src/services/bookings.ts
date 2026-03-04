/**
 * src/services/bookings.ts
 * Connects to Django:
 *   bookings   → /api/v1/marketplace/jobs/
 *   payments   → /api/v1/finance/transactions/
 *   reports    → /api/v1/moderation/reports/
 *
 * Field mapping:
 *   booking_status   → job_status (also exposed as booking_status alias by serializer)
 *   category_name    → category_name (computed field in serializer)
 */
import { api } from '@/api';

export interface Booking {
  id: string;
  user: string;
  user_phone: string;
  user_name: string;
  category: number;
  category_name: string;
  address: string | null;
  address_label: string;
  job_status: string;
  booking_status: string;   // alias for job_status
  final_price: string | null;
  description: string;
  scheduled_at: string | null;
  cancellation_reason: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;               // transaction_id in DB
  job: string | null;
  from_user: string | null;
  from_user_phone: string;
  to_user: string | null;
  to_user_phone: string;
  transaction_type: string;
  amount: string;
  currency: string;
  status: string;           // alias for transaction_status
  transaction_status: string;
  payment_method: string;
  gateway_reference: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter: string;
  reporter_phone: string;
  target_entity_type: string;
  target_entity_id: string | null;
  report_type: string;
  description: string;
  status: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

/** Unwrap DRF paginated response */
const unwrap = (data: any): any[] => data?.results ?? (Array.isArray(data) ? data : []);

// ─── Bookings (= Django Jobs) ─────────────────────────────────────────────────
export const bookingsService = {
  async getAll(): Promise<Booking[]> {
    const { data } = await api.get('/marketplace/jobs/');
    return unwrap(data);
  },

  async getById(id: string): Promise<Booking | null> {
    const { data } = await api.get(`/marketplace/jobs/${id}/`);
    return data;
  },

  async getByStatus(status: string): Promise<Booking[]> {
    const { data } = await api.get('/marketplace/jobs/', {
      params: { booking_status: status },
    });
    return unwrap(data);
  },

  async updateStatus(id: string, status: string, reason?: string): Promise<void> {
    await api.post(`/marketplace/jobs/${id}/update_status/`, { status, reason });
  },

  async getStats() {
    const bookings = await bookingsService.getAll();
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.job_status === 'pending').length,
      active: bookings.filter(b => ['accepted', 'in_progress'].includes(b.job_status)).length,
      completed: bookings.filter(b => b.job_status === 'completed').length,
      cancelled: bookings.filter(b => b.job_status === 'cancelled').length,
    };
  },
};

// ─── Payments (= Django Transactions) ────────────────────────────────────────
export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    const { data } = await api.get('/finance/transactions/');
    return unwrap(data);
  },

  async getStats() {
    const payments = await paymentsService.getAll();
    const success = payments.filter(p => p.transaction_status === 'success');
    const pending = payments.filter(p => p.transaction_status === 'pending');
    const refunded = payments.filter(p => p.transaction_type === 'refund');
    return {
      total: payments.length,
      totalAmount: payments.reduce((s, p) => s + Number(p.amount), 0),
      completed: success.length,
      completedAmount: success.reduce((s, p) => s + Number(p.amount), 0),
      pending: pending.length,
      pendingAmount: pending.reduce((s, p) => s + Number(p.amount), 0),
      refunded: refunded.length,
      refundedAmount: refunded.reduce((s, p) => s + Number(p.amount), 0),
    };
  },
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsService = {
  async getAll(): Promise<Report[]> {
    const { data } = await api.get('/moderation/reports/');
    return unwrap(data);
  },

  async getStats() {
    const reports = await reportsService.getAll();
    return {
      total: reports.length,
      open: reports.filter(r => r.status === 'open').length,
      underReview: reports.filter(r => r.status === 'in_review').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      dismissed: reports.filter(r => r.status === 'dismissed').length,
    };
  },
};
