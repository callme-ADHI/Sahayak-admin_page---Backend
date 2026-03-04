/**
 * src/services/workers.ts
 * Connects to Django /api/v1/accounts/worker_profiles/
 * Field mapping:
 *   Supabase 'workers' view   → Django 'worker_profiles' endpoint
 *   Supabase 'status'         → Django 'worker_status' (aliased as 'status' by serializer)
 *   Supabase 'verification_status' → Django 'verification_status' (mapped from worker_status)
 *   Supabase 'verification_documents' → Django 'verification_requests' endpoint
 */
import { api } from '@/api';

export interface Worker {
  user_id: string;          // PK — was 'id' in Supabase workers view
  phone: string;
  email: string | null;
  name: string;
  status: string;           // aliased from worker_status
  worker_status: string;
  verification_status: string;
  government_id_type: string;
  government_id_number: string | null;
  experience_years: number;
  bio: string;
  average_rating: string;
  total_jobs_completed: number;
  is_available: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/** Unwrap Django paginated response → plain array */
const unwrap = (data: any): any[] => data?.results ?? (Array.isArray(data) ? data : []);

export const workersService = {
  async getAll(): Promise<Worker[]> {
    const { data } = await api.get('/accounts/worker_profiles/');
    return unwrap(data);
  },

  async getById(id: string): Promise<Worker | null> {
    const { data } = await api.get(`/accounts/worker_profiles/${id}/`);
    return data;
  },

  async getPendingApprovals(): Promise<Worker[]> {
    const { data } = await api.get('/accounts/worker_profiles/', {
      params: { worker_status: 'pending' },
    });
    return unwrap(data);
  },

  async approveWorker(id: string, adminNotes?: string): Promise<void> {
    await api.post(`/accounts/worker_profiles/${id}/approve/`, { admin_notes: adminNotes });
    // Update the most recent pending verification request
    const { data: vrs } = await api.get('/accounts/verification_requests/', {
      params: { worker: id, status: 'pending' },
    });
    const pending = (vrs?.results ?? vrs ?? [])[0];
    if (pending) {
      await api.patch(`/accounts/verification_requests/${pending.id}/`, {
        status: 'approved',
        admin_notes: adminNotes,
        reviewed_at: new Date().toISOString(),
      });
    }
  },

  async rejectWorker(id: string, reason: string): Promise<void> {
    await api.post(`/accounts/worker_profiles/${id}/reject/`, { reason });
  },

  async suspendWorker(id: string): Promise<void> {
    await api.post(`/accounts/worker_profiles/${id}/suspend/`);
  },

  async banWorker(id: string): Promise<void> {
    await api.post(`/accounts/worker_profiles/${id}/ban/`);
  },

  async activateWorker(id: string): Promise<void> {
    // Activate = approve the worker
    await api.post(`/accounts/worker_profiles/${id}/approve/`);
  },

  async getStats() {
    const workers = await workersService.getAll();
    return {
      total: workers.length,
      active: workers.filter(w => w.status === 'active').length,
      verified: workers.filter(w => w.verification_status === 'approved').length,
      pending: workers.filter(w => w.worker_status === 'pending').length,
      suspended: workers.filter(w => w.status === 'suspended').length,
    };
  },
};
