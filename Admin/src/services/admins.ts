import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Admin = Tables<'admins'>;
export type Role = Tables<'roles'>;
export type AuditLog = Tables<'audit_logs'>;

export const adminsService = {
  async getAll() {
    const { data, error } = await supabase.from('admins').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getRoles() {
    const { data, error } = await supabase.from('roles').select('*').eq('is_active', true).order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getAuditLogs(limit = 100) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`*, admins(id, name, email)`)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async createAuditLog(log: { action_type: string; target_type: string; description: string; target_id?: string }) {
    const { error } = await supabase.from('audit_logs').insert(log);
    if (error) throw error;
  },
};
