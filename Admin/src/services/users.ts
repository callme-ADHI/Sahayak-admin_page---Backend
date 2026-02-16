import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type User = Tables<'users'>;
export type Address = Tables<'addresses'>;

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('users').select(`*, addresses(*)`).eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async suspendUser(id: string): Promise<void> {
    const { error } = await supabase.from('users').update({ status: 'suspended' }).eq('id', id);
    if (error) throw error;
  },

  async banUser(id: string): Promise<void> {
    const { error } = await supabase.from('users').update({ status: 'banned' }).eq('id', id);
    if (error) throw error;
  },

  async activateUser(id: string): Promise<void> {
    const { error } = await supabase.from('users').update({ status: 'active' }).eq('id', id);
    if (error) throw error;
  },

  async getStats() {
    const { data, error } = await supabase.from('users').select('status');
    if (error) throw error;
    return {
      total: data.length,
      active: data.filter(u => u.status === 'active').length,
      suspended: data.filter(u => u.status === 'suspended').length,
      banned: data.filter(u => u.status === 'banned').length,
    };
  },
};
