import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AlertCardProps {
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  onDismiss?: () => void;
}

export const AlertCard = ({ type, title, message, onDismiss }: AlertCardProps) => {
  const icons = {
    warning: AlertTriangle,
    danger: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      'alert-card',
      type === 'warning' && 'alert-card-warning',
      type === 'danger' && 'alert-card-danger',
      type === 'info' && 'alert-card-info'
    )}>
      <Icon className={cn(
        'w-5 h-5 flex-shrink-0',
        type === 'warning' && 'text-warning',
        type === 'danger' && 'text-destructive',
        type === 'info' && 'text-info'
      )} />
      <div className="flex-1">
        <h4 className="font-medium text-sm text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
      </div>
      {onDismiss && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
