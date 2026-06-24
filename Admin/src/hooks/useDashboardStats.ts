import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const fetchTable = async (table: string, select = 'id, status'): Promise<any[]> => {
        // Strict Data Check: If using placeholder URL, return empty to prevent "ghost" data
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
          return [];
        }

        // @ts-ignore - Supabase types are strict about table names
        const { data, error } = await supabase.from(table).select(select);
        if (error) {
          console.warn(`Failed to fetch ${table}:`, error);
          return [];
        }
        return data || [];
      };

      const [workers, users, bookings, payments, reports, verifications] = await Promise.all([
        fetchTable('workers', 'id, verification_status, is_available'),
        fetchTable('users', 'id, status'),
        fetchTable('bookings', 'id, booking_status, payment_status'),
        fetchTable('payments', 'id, status'),
        fetchTable('reports', 'id, status'),
        fetchTable('verification_requests', 'id, status'),
      ]);

      // usage of simplified variables directly


      return {
        totalWorkers: workers.length,
        totalUsers: users.length,
        activeWorks: bookings.filter(b => ['pending', 'accepted', 'in_progress'].includes(b.booking_status)).length,
        pendingRequests: bookings.filter(b => b.booking_status === 'pending').length,
        cancelledWorks: bookings.filter(b => b.booking_status === 'cancelled').length,
        completedWorks: bookings.filter(b => b.booking_status === 'completed').length,
        paymentIssues: payments.filter(p => p.status === 'failed').length,
        pendingApprovals: verifications.filter(v => v.status === 'pending').length,
        activeWorkers: workers.filter(w => w.is_available).length,
        activeUsers: users.filter(u => u.status === 'active').length,
        openReports: reports.filter(r => r.status === 'open').length,
      };
    },
  });
};

export const useGrowthData = (days: number = 365) => {
  return useQuery({
    queryKey: ['growth-data', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('daily_statistics')
        .select('*')
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });
      if (error) throw error;
      return (data || []).map(d => {
        const date = new Date(d.date);
        // For < 90 days, show Day Month (e.g., 12 Dec), else show Month Year (e.g., Dec 2024)
        const label = days <= 90
          ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        return {
          month: label,
          workers: d.new_workers || 0,
          users: d.new_users || 0,
          works: d.total_bookings || 0,
          revenue: d.total_revenue || 0,
          payouts: d.worker_earnings || 0,
        };
      });
    },
  });
};

export const useCategoryVolume = () => {
  return useQuery({
    queryKey: ['category-volume'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('category_name');
      if (error) throw error;

      const volumeMap: Record<string, number> = {};
      (data || []).forEach(b => {
        volumeMap[b.category_name] = (volumeMap[b.category_name] || 0) + 1;
      });

      return Object.entries(volumeMap).map(([category, count]) => ({
        category,
        count,
      }));
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, admins(name)')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;

      return (data || []).map(log => ({
        id: log.id,
        action: log.description,
        user: log.admins?.name || 'System',
        time: getRelativeTime(log.created_at),
        type: log.action_type,
      }));
    },
  });
};

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}
