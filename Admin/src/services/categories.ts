/**
 * src/services/categories.ts
 * Connects to Django /api/v1/marketplace/categories/
 * No field renames needed — category model matches frontend expectations.
 */
import { api } from '@/api';

export interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  base_rate: string | null;   // DecimalField returns string from DRF
  is_active: boolean;
  display_order: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/** Unwrap DRF paginated response */
const unwrap = (data: any): any[] => data?.results ?? (Array.isArray(data) ? data : []);

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get('/marketplace/categories/');
    return unwrap(data);
  },

  async getById(id: string | number): Promise<Category | null> {
    const { data } = await api.get(`/marketplace/categories/${id}/`);
    return data;
  },

  async create(category: { name: string; description?: string; icon?: string; base_rate?: number }): Promise<Category> {
    const { data } = await api.post('/marketplace/categories/', category);
    return data;
  },

  async update(
    id: string | number,
    category: { name?: string; description?: string; icon?: string; base_rate?: number; is_active?: boolean }
  ): Promise<Category> {
    const { data } = await api.patch(`/marketplace/categories/${id}/`, category);
    return data;
  },

  async delete(id: string | number): Promise<void> {
    // Soft delete — set is_deleted=true
    await api.patch(`/marketplace/categories/${id}/`, { is_deleted: true });
  },

  async getWithBookingCount(): Promise<(Category & { bookings_count: number })[]> {
    const [categories, bookings] = await Promise.all([
      categoriesService.getAll(),
      api.get('/marketplace/jobs/').then(r => unwrap(r.data)),
    ]);
    const countMap = bookings.reduce((acc: Record<string | number, number>, b: any) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {});
    return categories.map(cat => ({ ...cat, bookings_count: countMap[cat.id] || 0 }));
  },
};
