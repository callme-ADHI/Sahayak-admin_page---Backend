import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MoreHorizontal, User, Ban, AlertTriangle } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useUsers } from '@/hooks/useUsers';
import { useWorkers } from '@/hooks/useWorkers';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ProfilesList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: workers = [], isLoading: workersLoading } = useWorkers();

  const isLoading = usersLoading || workersLoading;

  // Combine users and workers into profiles
  const profiles = [
    ...users.map(u => ({ ...u, role: 'User' as const, profileType: 'user' as const })),
    ...workers.map(w => ({ ...w, role: 'Worker' as const, profileType: 'worker' as const })),
  ];

  const getFilteredData = () => {
    switch (activeTab) {
      case 'workers':
        return profiles.filter(p => p.role === 'Worker');
      case 'users':
        return profiles.filter(p => p.role === 'User');
      default:
        return profiles;
    }
  };

  const columns = [
    {
      key: 'avatar',
      header: '',
      render: (item: any) => (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {item.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
          </AvatarFallback>
        </Avatar>
      ),
    },
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'role',
      header: 'Role',
      render: (item: any) => (
        <span className={`text-sm font-medium ${item.role === 'Worker' ? 'text-primary' : 'text-success'}`}>
          {item.role}
        </span>
      ),
    },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'id', header: 'UID', sortable: true, render: (item: any) => item.id.slice(0, 8) },
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
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profiles/${item.profileType}/${item.id}`);
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
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Send Warning
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-warning">
                Suspend Account
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Ban className="w-4 h-4 mr-2" />
                Ban User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'banned', label: 'Banned' },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">All Profiles</h1>
          <p className="page-subtitle">Loading profiles...</p>
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">All Profiles</h1>
        <p className="page-subtitle">Manage workers and employers on the platform</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({profiles.length})</TabsTrigger>
          <TabsTrigger value="workers">Workers ({profiles.filter(p => p.role === 'Worker').length})</TabsTrigger>
          <TabsTrigger value="users">Users ({profiles.filter(p => p.role === 'User').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            data={getFilteredData()}
            columns={columns}
            searchPlaceholder="Search by name, phone, email or UID..."
            filters={filters}
            onRowClick={(item) => navigate(`/profiles/${item.profileType}/${item.id}`)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilesList;
