import { useQuery } from '@tanstack/react-query';
import { paymentsService } from '@/services/bookings';

export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsService.getAll(),
  });
};

export const usePaymentStats = () => {
  return useQuery({
    queryKey: ['payment-stats'],
    queryFn: () => paymentsService.getStats(),
  });
};
