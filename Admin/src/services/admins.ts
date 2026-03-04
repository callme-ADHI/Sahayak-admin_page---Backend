import { api } from '@/api';

export const adminsService = {
  async getAll() {
    const { data } = await api.get('/accounts/users/', { params: { is_staff: 'True' } });
    return data.results || data;
  },

  async getRoles() {
    const { data } = await api.get('/accounts/roles/');
    return data.results || data;
  },

  async getAuditLogs(limit = 100) {
    const { data } = await api.get('/moderation/audit_logs/');
    // DRF pagination might ignore limit param if not configured, but we return results
    return (data.results || data).slice(0, limit);
  },

  async createAuditLog(log: { action_type: string; target_type: string; description: string; target_id?: string }) {
    const { data } = await api.post('/moderation/audit_logs/', log);
    return data;
  },
};
