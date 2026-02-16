import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useBookings, useBookingStats } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const WorksOverview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { data: bookings = [], isLoading } = useBookings();
  const { data: stats } = useBookingStats();

  const getFilteredData = () => {
    switch (activeTab) {
      case 'active':
        return bookings.filter((w: any) => ['accepted', 'in_progress'].includes(w.booking_status));
      case 'completed':
        return bookings.filter((w: any) => w.booking_status === 'completed');
      case 'pending':
        return bookings.filter((w: any) => w.booking_status === 'pending');
      case 'cancelled':
        return bookings.filter((w: any) => w.booking_status === 'cancelled');
      default:
        return bookings;
    }
  };

  const columns = [
    { key: 'id', header: 'Work ID', sortable: true, render: (item: any) => item.id.slice(0, 8) },
    { key: 'category_name', header: 'Category', sortable: true },
    { key: 'user', header: 'User Name', sortable: true, render: (item: any) => item.users?.name || '-' },
    { key: 'worker', header: 'Worker Name', sortable: true, render: (item: any) => item.workers?.name || 'Unassigned' },
    {
      key: 'booking_status',
      header: 'Status',
      render: (item: any) => <StatusBadge status={item.booking_status} />,
    },
    { key: 'service_date', header: 'Service Date', sortable: true },
    { key: 'start_time', header: 'Time' },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (item: any) => <StatusBadge status={item.payment_status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/works/detail/${item.id}`);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Reassign Worker</DropdownMenuItem>
              <DropdownMenuItem>Mark Complete</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Cancel Work</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: 'category_name',
      label: 'Category',
      options: [
        { value: 'Plumbing', label: 'Plumbing' },
        { value: 'Electrical', label: 'Electrical' },
        { value: 'Cleaning', label: 'Cleaning' },
        { value: 'AC Repair', label: 'AC Repair' },
      ],
    },
    {
      key: 'payment_status',
      label: 'Payment',
      options: [
        { value: 'paid', label: 'Paid' },
        { value: 'pending', label: 'Pending' },
        { value: 'refunded', label: 'Refunded' },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Works Overview</h1>
          <p className="page-subtitle">Loading works...</p>
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Works Overview</h1>
        <p className="page-subtitle">Manage all work requests and assignments</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Works ({stats?.total || bookings.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats?.active || 0})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats?.pending || 0})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats?.completed || 0})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({stats?.cancelled || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            data={getFilteredData()}
            columns={columns}
            searchPlaceholder="Search by ID, category, user or worker..."
            filters={filters}
            onRowClick={(item) => navigate(`/works/detail/${item.id}`)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorksOverview;
