import { useState } from 'react';
import { Bell, CreditCard, Briefcase, UserCheck, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const Notifications = () => {
  const { notifications: notificationsData = [], isLoading } = useAdminNotifications();
  const [notifications, setNotifications] = useState<typeof notificationsData>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Update local state when data loads
  if (notificationsData.length > 0 && notifications.length === 0) {
    setNotifications(notificationsData);
  }

  const displayNotifications = notifications.length > 0 ? notifications : notificationsData;

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return CreditCard;
      case 'booking':
        return Briefcase;
      case 'verification':
        return UserCheck;
      case 'system':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'text-warning bg-warning/10';
      case 'booking':
        return 'text-info bg-info/10';
      case 'verification':
        return 'text-success bg-success/10';
      case 'system':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const markAllRead = () => {
    setNotifications(displayNotifications.map(n => ({ ...n, is_read: true })));
  };

  const markSelectedRead = () => {
    setNotifications(displayNotifications.map(n =>
      selectedIds.includes(n.id) ? { ...n, is_read: true } : n
    ));
    setSelectedIds([]);
  };

  const deleteSelected = () => {
    setNotifications(displayNotifications.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const unreadCount = displayNotifications.filter(n => !n.is_read).length;

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Loading notifications...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 mb-4" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread notifications</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={markSelectedRead}>
                <Check className="w-4 h-4 mr-2" />
                Mark Read
              </Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={deleteSelected}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
          <Button variant="outline" onClick={markAllRead}>
            Mark All as Read
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {displayNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {displayNotifications.map(notification => {
                const Icon = getIcon(notification.notification_type);
                const iconColor = getIconColor(notification.notification_type);

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-4 p-4 transition-colors hover:bg-muted/50',
                      !notification.is_read && 'bg-primary/5'
                    )}
                  >
                    <Checkbox
                      checked={selectedIds.includes(notification.id)}
                      onCheckedChange={() => toggleSelect(notification.id)}
                    />
                    <div className={cn('p-2 rounded-lg', iconColor)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          'text-sm',
                          !notification.is_read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
                        )}>
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">{getRelativeTime(notification.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No notifications</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
