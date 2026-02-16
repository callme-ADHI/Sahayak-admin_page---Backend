import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsService } from '@/services/bookings';

export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsService.getAll(),
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsService.getById(id),
    enabled: !!id,
  });
};

export const useBookingStats = () => {
  return useQuery({
    queryKey: ['booking-stats'],
    queryFn: () => bookingsService.getStats(),
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
    },
  });
};
