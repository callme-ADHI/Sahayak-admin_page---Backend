/**
 * src/hooks/useDashboardStats.ts
 * Replaced all supabase calls with Django API via analyticsService.
 * Growth data now uses /core/daily_statistics/?days=N
 * Recent activity from /moderation/audit_logs/
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { analyticsService } from '@/services/analytics';

const unwrap = (data: any): any[] => data?.results ?? (Array.isArray(data) ? data : []);

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsService.getDashboardStats(),
    retry: 1,
  });
};

export const useGrowthData = (days: number = 365) => {
  return useQuery({
    queryKey: ['growth-data', days],
    queryFn: async () => {
      const { data } = await api.get('/core/daily_statistics/', { params: { days } });
      return unwrap(data).map((d: any) => {
        const date = new Date(d.date);
        const label = days <= 90
          ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        return {
          month: label,
          workers: d.new_workers || 0,
          users: d.new_users || 0,
          works: d.total_bookings || 0,
          revenue: Number(d.total_revenue) || 0,
          // worker_earnings is aliased from total_payouts by DailyStatisticSerializer
          payouts: Number(d.worker_earnings ?? d.total_payouts) || 0,
        };
      });
    },
    retry: 1,
  });
};

export const useCategoryVolume = () => {
  return useQuery({
    queryKey: ['category-volume'],
    queryFn: () => analyticsService.getCategoryVolume(),
    retry: 1,
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data } = await api.get('/moderation/audit_logs/');
      const logs = unwrap(data).slice(0, 10);
      return logs.map((log: any) => ({
        id: log.id,
        action: log.description,
        user: log.admin_name || 'System',   // admin_name computed by AuditLogSerializer
        time: getRelativeTime(log.created_at),
        type: log.action_type,
      }));
    },
    retry: 1,
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
