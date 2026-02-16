import { useQuery } from '@tanstack/react-query';
import { adminsService } from '@/services/admins';

export const useAdmins = () => {
  return useQuery({
    queryKey: ['admins'],
    queryFn: () => adminsService.getAll(),
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => adminsService.getRoles(),
  });
};

export const useAuditLogs = (limit = 100) => {
  return useQuery({
    queryKey: ['audit-logs', limit],
    queryFn: () => adminsService.getAuditLogs(limit),
  });
};
