import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Worker = Tables<'workers'>;
export type VerificationDocument = Tables<'verification_documents'>;

export const workersService = {
  async getAll(): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('workers')
      .select(`*, verification_documents(*), worker_categories(id, category_id, is_primary, years_experience, categories(id, name))`)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getPendingApprovals() {
    const { data, error } = await supabase
      .from('workers')
      .select(`*, verification_documents(*), worker_categories(id, category_id, is_primary, years_experience, categories(id, name))`)
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async approveWorker(id: string, adminNotes?: string): Promise<void> {
    const { error } = await supabase
      .from('workers')
      .update({ verification_status: 'approved', is_verified: true, verified_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await supabase
      .from('verification_documents')
      .update({ verification_status: 'approved', verified_at: new Date().toISOString(), admin_notes: adminNotes })
      .eq('worker_id', id)
      .eq('verification_status', 'pending');
  },

  async rejectWorker(id: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('workers')
      .update({ verification_status: 'rejected', is_verified: false })
      .eq('id', id);

    if (error) throw error;

    await supabase
      .from('verification_documents')
      .update({ verification_status: 'rejected', rejection_reason: reason })
      .eq('worker_id', id)
      .eq('verification_status', 'pending');
  },

  async suspendWorker(id: string): Promise<void> {
    const { error } = await supabase.from('workers').update({ status: 'suspended' }).eq('id', id);
    if (error) throw error;
  },

  async banWorker(id: string): Promise<void> {
    const { error } = await supabase.from('workers').update({ status: 'banned' }).eq('id', id);
    if (error) throw error;
  },

  async activateWorker(id: string): Promise<void> {
    const { error } = await supabase.from('workers').update({ status: 'active' }).eq('id', id);
    if (error) throw error;
  },

  async getStats() {
    const { data, error } = await supabase.from('workers').select('status, verification_status, is_verified');
    if (error) throw error;

    return {
      total: data.length,
      active: data.filter(w => w.status === 'active').length,
      verified: data.filter(w => w.is_verified).length,
      pending: data.filter(w => w.verification_status === 'pending').length,
      suspended: data.filter(w => w.status === 'suspended').length,
    };
  },
};
