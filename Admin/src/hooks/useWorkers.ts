import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workersService } from '@/services/workers';

export const useWorkers = () => {
  return useQuery({
    queryKey: ['workers'],
    queryFn: () => workersService.getAll(),
  });
};

export const useWorker = (id: string) => {
  return useQuery({
    queryKey: ['worker', id],
    queryFn: () => workersService.getById(id),
    enabled: !!id,
  });
};

export const usePendingVerifications = () => {
  return useQuery({
    queryKey: ['pending-verifications'],
    queryFn: () => workersService.getPendingApprovals(),
  });
};

export const useWorkerStats = () => {
  return useQuery({
    queryKey: ['worker-stats'],
    queryFn: () => workersService.getStats(),
  });
};

export const useApproveWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminNotes }: { id: string; adminNotes?: string }) => 
      workersService.approveWorker(id, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['worker-stats'] });
    },
  });
};

export const useRejectWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      workersService.rejectWorker(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['worker-stats'] });
    },
  });
};
