import { useState } from 'react';
import { Download, Filter, Search, User, Settings, FileText, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

const useAuditLogs = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, admins(name, email)')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });
};

const AuditLogs = () => {
  const { data: logs = [], isLoading } = useAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create': return <FileText className="w-4 h-4 text-success" />;
      case 'update': return <Settings className="w-4 h-4 text-primary" />;
      case 'delete': return <Shield className="w-4 h-4 text-destructive" />;
      case 'login': return <User className="w-4 h-4 text-info" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionBadge = (actionType: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      create: 'default',
      update: 'secondary',
      delete: 'destructive',
      login: 'outline',
    };
    return (
      <Badge variant={variants[actionType] || 'outline'} className="capitalize">
        {actionType}
      </Badge>
    );
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.target_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
    const matchesTarget = targetFilter === 'all' || log.target_type === targetFilter;
    return matchesSearch && matchesAction && matchesTarget;
  });

  const columns = [
    {
      key: 'created_at',
      header: 'Timestamp',
      sortable: true,
      render: (item: any) => (
        <div className="text-sm">
          <p className="font-medium">{format(new Date(item.created_at), 'MMM dd, yyyy')}</p>
          <p className="text-muted-foreground text-xs">{format(new Date(item.created_at), 'HH:mm:ss')}</p>
        </div>
      ),
    },
    {
      key: 'action_type',
      header: 'Action',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          {getActionIcon(item.action_type)}
          {getActionBadge(item.action_type)}
        </div>
      ),
    },
    {
      key: 'target_type',
      header: 'Target',
      render: (item: any) => (
        <Badge variant="outline" className="capitalize">
          {item.target_type}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item: any) => (
        <p className="text-sm max-w-md truncate">{item.description}</p>
      ),
    },
    {
      key: 'admin',
      header: 'Performed By',
      render: (item: any) => (
        <div className="text-sm">
          <p className="font-medium">{item.admins?.name || 'System'}</p>
          <p className="text-muted-foreground text-xs">{item.admins?.email || '-'}</p>
        </div>
      ),
    },
    {
      key: 'ip_address',
      header: 'IP Address',
      render: (item: any) => (
        <span className="text-sm font-mono text-muted-foreground">
          {item.ip_address || '-'}
        </span>
      ),
    },
  ];

  const actionTypes = [...new Set(logs.map(l => l.action_type))];
  const targetTypes = [...new Set(logs.map(l => l.target_type))];

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Action', 'Target', 'Description', 'Admin', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.action_type,
        log.target_type,
        `"${log.description?.replace(/"/g, '""') || ''}"`,
        log.admins?.name || 'System',
        log.ip_address || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Loading activity logs...</p>
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Track all administrative actions and system events</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{logs.length}</div>
            <p className="text-sm text-muted-foreground">Total Logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">
              {logs.filter(l => l.action_type === 'create').length}
            </div>
            <p className="text-sm text-muted-foreground">Creates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {logs.filter(l => l.action_type === 'update').length}
            </div>
            <p className="text-sm text-muted-foreground">Updates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {logs.filter(l => l.action_type === 'delete').length}
            </div>
            <p className="text-sm text-muted-foreground">Deletes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actionTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={targetFilter} onValueChange={setTargetFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Target Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Targets</SelectItem>
            {targetTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredLogs}
        columns={columns}
        searchPlaceholder="Search logs..."
      />
    </div>
  );
};

export default AuditLogs;
