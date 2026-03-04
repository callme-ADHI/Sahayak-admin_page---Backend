/**
 * src/services/analytics.ts
 * Connects to Django:
 *   stats      → /api/v1/accounts/users/ + worker_profiles/ + marketplace/jobs/ + finance/transactions/
 *   growth     → /api/v1/core/daily_statistics/?days=N
 *   categories → /api/v1/marketplace/jobs/ (group by category_name)
 *   activity   → /api/v1/moderation/audit_logs/
 *
 * Field mapping:
 *   Supabase worker_earnings → Django total_payouts (aliased as worker_earnings by serializer)
 *   Supabase category_name  → Django category_name (computed alias in JobSerializer)
 */
import { api } from '@/api';

const unwrap = (data: any): any[] => data?.results ?? (Array.isArray(data) ? data : []);

export const analyticsService = {
  async getDailyStatistics(days = 7) {
    const { data } = await api.get('/core/daily_statistics/', { params: { days } });
    return unwrap(data);
  },

  async getDashboardStats() {
    const [workers, users, jobs, transactions, reports, verifications] = await Promise.all([
      api.get('/accounts/worker_profiles/').then(r => unwrap(r.data)),
      api.get('/accounts/users/').then(r => unwrap(r.data)),
      api.get('/marketplace/jobs/').then(r => unwrap(r.data)),
      api.get('/finance/transactions/').then(r => unwrap(r.data)),
      api.get('/moderation/reports/').then(r => unwrap(r.data)),
      api.get('/accounts/verification_requests/').then(r => unwrap(r.data)).catch(() => []),
    ]);

    return {
      totalWorkers: workers.length,
      totalUsers: users.length,
      activeWorks: jobs.filter((b: any) => ['accepted', 'in_progress'].includes(b.job_status)).length,
      pendingRequests: jobs.filter((b: any) => b.job_status === 'pending').length,
      cancelledWorks: jobs.filter((b: any) => b.job_status === 'cancelled').length,
      completedWorks: jobs.filter((b: any) => b.job_status === 'completed').length,
      paymentIssues: transactions.filter((p: any) => p.transaction_status === 'failed').length,
      pendingApprovals: verifications.filter((v: any) => v.status === 'pending').length,
      activeWorkers: workers.filter((w: any) => w.is_available && w.worker_status === 'active').length,
      activeUsers: users.filter((u: any) => u.account_status === 'active').length,
      openReports: reports.filter((r: any) => r.status === 'open').length,
    };
  },

  async getCategoryVolume() {
    const { data } = await api.get('/marketplace/jobs/');
    const jobs = unwrap(data);
    const volumeMap: Record<string, number> = {};
    jobs.forEach((b: any) => {
      const name = b.category_name || String(b.category);
      volumeMap[name] = (volumeMap[name] || 0) + 1;
    });
    return Object.entries(volumeMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  },
};
