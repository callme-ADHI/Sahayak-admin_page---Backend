import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outline';
}

const statusStyles: Record<string, string> = {
  // Work/General statuses
  Active: 'status-badge-success',
  Completed: 'status-badge-success',
  Paid: 'status-badge-success',
  Approved: 'status-badge-success',
  Resolved: 'status-badge-success',
  
  Pending: 'status-badge-warning',
  'In Review': 'status-badge-warning',
  New: 'status-badge-warning',
  Partial: 'status-badge-warning',
  Open: 'status-badge-warning',
  
  Cancelled: 'status-badge-danger',
  Failed: 'status-badge-danger',
  Banned: 'status-badge-danger',
  Suspended: 'status-badge-danger',
  Critical: 'status-badge-danger',
  High: 'status-badge-danger',
  
  Refunded: 'status-badge-info',
  Medium: 'status-badge-info',
  
  Inactive: 'status-badge-neutral',
  Low: 'status-badge-neutral',
};

export const StatusBadge = ({ status, variant = 'default' }: StatusBadgeProps) => {
  const style = statusStyles[status] || 'status-badge-neutral';
  
  return (
    <span className={cn('status-badge', style)}>
      {status}
    </span>
  );
};
