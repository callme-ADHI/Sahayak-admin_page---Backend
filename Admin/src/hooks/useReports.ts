import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/bookings';

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsService.getAll(),
  });
};

export const useReportStats = () => {
  return useQuery({
    queryKey: ['report-stats'],
    queryFn: () => reportsService.getStats(),
  });
};
