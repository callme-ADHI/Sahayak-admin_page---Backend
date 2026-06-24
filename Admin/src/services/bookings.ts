import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Booking = Tables<'bookings'>;
export type Payment = Tables<'payments'>;
export type Report = Tables<'reports'>;

export const bookingsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, users(id, name, phone, email), workers(id, name, phone, email), categories(id, name, icon)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, users(id, name, phone, email), workers(id, name, phone, email), categories(id, name, icon)`)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, users(id, name, phone, email), workers(id, name, phone, email), categories(id, name, icon)`)
      .eq('booking_status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string): Promise<void> {
    const updates: Record<string, string> = { booking_status: status };
    if (status === 'accepted') updates.accepted_at = new Date().toISOString();
    else if (status === 'in_progress') updates.started_at = new Date().toISOString();
    else if (status === 'completed') updates.completed_at = new Date().toISOString();
    else if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();

    const { error } = await supabase.from('bookings').update(updates).eq('id', id);
    if (error) throw error;
  },

  async getStats() {
    const { data, error } = await supabase.from('bookings').select('booking_status');
    if (error) throw error;
    return {
      total: data.length,
      pending: data.filter(b => b.booking_status === 'pending').length,
      active: data.filter(b => ['accepted', 'in_progress'].includes(b.booking_status)).length,
      completed: data.filter(b => b.booking_status === 'completed').length,
      cancelled: data.filter(b => b.booking_status === 'cancelled').length,
    };
  },
};

export const paymentsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select(`*, users(id, name, phone, email), workers(id, name, phone, email), bookings(id, category_name, booking_status)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getStats() {
    const { data, error } = await supabase.from('payments').select('status, amount, refund_amount');
    if (error) throw error;
    const completed = data.filter(p => p.status === 'success');
    const pending = data.filter(p => p.status === 'pending');
    const refunded = data.filter(p => p.status === 'refunded');
    return {
      total: data.length,
      totalAmount: data.reduce((sum, p) => sum + Number(p.amount), 0),
      completed: completed.length,
      completedAmount: completed.reduce((sum, p) => sum + Number(p.amount), 0),
      pending: pending.length,
      pendingAmount: pending.reduce((sum, p) => sum + Number(p.amount), 0),
      refunded: refunded.length,
      refundedAmount: refunded.reduce((sum, p) => sum + Number(p.refund_amount || 0), 0),
    };
  },
};

export const reportsService = {
  async getAll() {
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getStats() {
    const { data, error } = await supabase.from('reports').select('status');
    if (error) throw error;
    return {
      total: data.length,
      open: data.filter(r => r.status === 'open').length,
      underReview: data.filter(r => r.status === 'under_review').length,
      resolved: data.filter(r => r.status === 'resolved').length,
      dismissed: data.filter(r => r.status === 'dismissed').length,
    };
  },
};
