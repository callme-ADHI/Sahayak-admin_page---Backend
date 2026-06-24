import { supabase } from '@/integrations/supabase/client';

export const analyticsService = {
  async getDailyStatistics(days = 7) {
    const { data, error } = await supabase
      .from('daily_statistics')
      .select('*')
      .order('date', { ascending: false })
      .limit(days);
    if (error) throw error;
    return data;
  },

  async getDashboardStats() {
    const { data: workers } = await supabase.from('workers').select('status, verification_status, is_available');
    const { data: users } = await supabase.from('users').select('status');
    const { data: bookings } = await supabase.from('bookings').select('booking_status, created_at');
    const { data: payments } = await supabase.from('payments').select('status');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      totalWorkers: workers?.length || 0,
      totalUsers: users?.length || 0,
      activeWorks: bookings?.filter(b => ['accepted', 'in_progress'].includes(b.booking_status)).length || 0,
      pendingRequests: bookings?.filter(b => b.booking_status === 'pending').length || 0,
      cancelledWorks: bookings?.filter(b => b.booking_status === 'cancelled').length || 0,
      newWorkRequests: bookings?.filter(b => new Date(b.created_at) >= today && b.booking_status === 'pending').length || 0,
      paymentIssues: payments?.filter(p => p.status === 'failed').length || 0,
      pendingApprovals: workers?.filter(w => w.verification_status === 'pending').length || 0,
      activeWorkers: workers?.filter(w => w.status === 'active' && w.is_available).length || 0,
      activeUsers: users?.filter(u => u.status === 'active').length || 0,
    };
  },

  async getCategoryVolume() {
    const { data, error } = await supabase.from('bookings').select('category_name');
    if (error) throw error;
    const volumeMap = data.reduce((acc, b) => {
      acc[b.category_name] = (acc[b.category_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(volumeMap).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
  },
};
