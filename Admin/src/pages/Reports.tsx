import { useState } from 'react';
import { Eye, MessageSquare } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useReports, useReportStats } from '@/hooks/useReports';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { data: reports = [], isLoading } = useReports();
  const { data: stats } = useReportStats();

  const getFilteredData = () => {
    switch (activeTab) {
      case 'complaints':
        return reports.filter(r => r.report_type === 'complaint');
      case 'feedback':
        return reports.filter(r => r.report_type === 'feedback');
      case 'system':
        return reports.filter(r => r.report_type === 'system');
      default:
        return reports;
    }
  };

  const columns = [
    { key: 'id', header: 'Report ID', sortable: true, render: (item: any) => item.id.slice(0, 8) },
    {
      key: 'report_type',
      header: 'Type',
      render: (item: any) => (
        <span className={`text-sm font-medium ${
          item.report_type === 'complaint' ? 'text-destructive' :
          item.report_type === 'feedback' ? 'text-success' :
          'text-info'
        }`}>
          {item.report_type}
        </span>
      ),
    },
    { key: 'reporter_type', header: 'Reporter Type' },
    { key: 'reported_type', header: 'Reported Type' },
    {
      key: 'priority',
      header: 'Priority',
      render: (item: any) => <StatusBadge status={item.priority || 'medium'} />,
    },
    { key: 'created_at', header: 'Date', sortable: true, render: (item: any) => new Date(item.created_at).toLocaleDateString() },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="w-4 h-4 mr-1" />
            Respond
          </Button>
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'open', label: 'Open' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'dismissed', label: 'Dismissed' },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Reports & Feedback</h1>
          <p className="page-subtitle">Loading reports...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Reports & Feedback</h1>
        <p className="page-subtitle">Manage complaints, feedback, and system reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{stats?.total || 0}</div>
            <p className="text-sm text-muted-foreground">Total Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">{stats?.open || 0}</div>
            <p className="text-sm text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-info">{stats?.underReview || 0}</div>
            <p className="text-sm text-muted-foreground">Under Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{stats?.resolved || 0}</div>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({reports.length})</TabsTrigger>
          <TabsTrigger value="complaints">Complaints ({reports.filter(r => r.report_type === 'complaint').length})</TabsTrigger>
          <TabsTrigger value="feedback">Feedback ({reports.filter(r => r.report_type === 'feedback').length})</TabsTrigger>
          <TabsTrigger value="system">System ({reports.filter(r => r.report_type === 'system').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            data={getFilteredData()}
            columns={columns}
            searchPlaceholder="Search reports..."
            filters={filters}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
