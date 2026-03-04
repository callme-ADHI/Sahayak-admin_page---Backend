/**
 * src/services/users.ts
 * Connects to Django /api/v1/accounts/users/
 * Field name changes:
 *   Supabase 'status'        → Django 'account_status' (aliased as 'status' by serializer)
 *   Supabase PATCH {status}  → Django POST /users/{id}/suspend|ban|activate/
 */
import { api } from '@/api';

export interface User {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  status: string;           // aliased from account_status
  account_status: string;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  date_joined: string;      // was created_at
  updated_at: string;
  last_login: string | null;
}

/** Unwrap Django paginated response → plain array */
const unwrap = (data: any): any[] => data?.results ?? (Array.isArray(data) ? data : []);

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get('/accounts/users/');
    return unwrap(data);
  },

  async getById(id: string): Promise<User | null> {
    const { data } = await api.get(`/accounts/users/${id}/`);
    return data;
  },

  async suspendUser(id: string): Promise<void> {
    await api.post(`/accounts/users/${id}/suspend/`);
  },

  async banUser(id: string): Promise<void> {
    await api.post(`/accounts/users/${id}/ban/`);
  },

  async activateUser(id: string): Promise<void> {
    await api.post(`/accounts/users/${id}/activate/`);
  },

  async getStats() {
    const users = await usersService.getAll();
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      banned: users.filter(u => u.status === 'banned').length,
    };
  },
};
