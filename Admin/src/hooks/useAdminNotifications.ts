/**
 * src/hooks/useAdminNotifications.ts
 * Replaced all supabase calls with Django API /core/admin_notifications/
 * Field mapping: admin_id (Supabase) → recipient_id (Django, aliased as admin_id by serializer)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';

export interface AdminNotification {
  id: string;
  admin_id: string | null;        // aliased from recipient_id
  recipient: string | null;
  title: string;
  body: string;
  notification_type: string | null;
  priority: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

const unwrap = (data: any): AdminNotification[] =>
  data?.results ?? (Array.isArray(data) ? data : []);

export const useAdminNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data } = await api.get('/core/admin_notifications/');
      return unwrap(data);
    },
    retry: 1,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.post(`/core/admin_notifications/${notificationId}/mark_read/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await api.post('/core/admin_notifications/mark_all_read/');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.delete(`/core/admin_notifications/${notificationId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
  };
};
