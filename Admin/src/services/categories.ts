import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  base_rate: number | null;
  is_active: boolean | null;
  display_order: number | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryField {
  id: string;
  category_id: string;
  field_label: string;
  field_type: string;
  is_required: boolean | null;
  display_order: number | null;
  config: Json | null;
  created_at: string;
}

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getFields(categoryId: string): Promise<CategoryField[]> {
    const { data, error } = await supabase
      .from('category_fields')
      .select('*')
      .eq('category_id', categoryId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(category: { name: string; description?: string; icon?: string; base_rate?: number }): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, category: { name?: string; description?: string; icon?: string; base_rate?: number; is_active?: boolean }): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getWithBookingCount(): Promise<(Category & { bookings_count: number })[]> {
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (catError) throw catError;

    const { data: bookings, error: bookError } = await supabase
      .from('bookings')
      .select('category_id');

    if (bookError) throw bookError;

    const countMap = bookings.reduce((acc, b) => {
      acc[b.category_id] = (acc[b.category_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return categories.map(cat => ({
      ...cat,
      bookings_count: countMap[cat.id] || 0,
    }));
  },
};
