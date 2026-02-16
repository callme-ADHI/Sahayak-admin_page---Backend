import { useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { usePayments, usePaymentStats } from '@/hooks/usePayments';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { data: payments = [], isLoading } = usePayments();
  const { data: stats } = usePaymentStats();

  const getFilteredData = () => {
    switch (activeTab) {
      case 'completed':
        return payments.filter(p => p.status === 'success');
      case 'pending':
        return payments.filter(p => p.status === 'pending');
      case 'refunds':
        return payments.filter(p => p.status === 'refunded');
      default:
        return payments;
    }
  };

  const columns = [
    { key: 'id', header: 'Payment ID', sortable: true, render: (item: any) => item.id.slice(0, 8) },
    { key: 'booking_id', header: 'Work ID', render: (item: any) => item.bookings?.id?.slice(0, 8) || '-' },
    { key: 'user', header: 'User (Payer)', render: (item: any) => item.users?.name || '-' },
    { key: 'worker', header: 'Worker (Recipient)', render: (item: any) => item.workers?.name || '-' },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: any) => (
        <span className="font-medium">₹{Number(item.amount).toLocaleString()}</span>
      ),
      sortable: true,
    },
    { key: 'payment_method', header: 'Method' },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />,
    },
    { key: 'created_at', header: 'Date', sortable: true, render: (item: any) => new Date(item.created_at).toLocaleDateString() },
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
            <Download className="w-4 h-4 mr-1" />
            Receipt
          </Button>
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: 'payment_method',
      label: 'Method',
      options: [
        { value: 'upi', label: 'UPI' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'card', label: 'Card' },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Loading payment data...</p>
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
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Manage payment transactions and payouts</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">₹{(stats?.totalAmount || 0).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">₹{(stats?.completedAmount || 0).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">₹{(stats?.pendingAmount || 0).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-info">₹{(stats?.refundedAmount || 0).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Refunded</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({payments.filter(p => p.status === 'success').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({payments.filter(p => p.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="refunds">Refunds ({payments.filter(p => p.status === 'refunded').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            data={getFilteredData()}
            columns={columns}
            searchPlaceholder="Search by ID, user, or worker..."
            filters={filters}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payments;
