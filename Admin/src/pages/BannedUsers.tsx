import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const unwrap = (data: any): any[] => data?.results ?? (Array.isArray(data) ? data : []);

const BannedUsers = () => {
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showUnbanDialog, setShowUnbanDialog] = useState(false);
    const [reason, setReason] = useState('');

    const { data: bannedUsers = [], isLoading } = useQuery({
        queryKey: ['banned-users'],
        queryFn: async () => {
            // Fetch suspended + banned users and workers from Django
            const [usersRes, workersRes] = await Promise.all([
                api.get('/accounts/users/', { params: { account_status: 'suspended' } }),
                api.get('/accounts/worker_profiles/', { params: { worker_status: 'suspended' } }),
            ]);
            const users = unwrap(usersRes.data).map((u: any) => ({ ...u, type: 'User' }));
            const workers = unwrap(workersRes.data).map((w: any) => ({
                ...w,
                id: w.user_id,    // WorkerProfile PK is user_id
                name: w.name,
                email: w.email,
                phone: w.phone,
                type: 'Worker',
            }));
            return [...users, ...workers];
        },
        retry: 1,
    });

    const unbanMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string; type: string }) => {
            if (type === 'User') {
                await api.post(`/accounts/users/${id}/activate/`);
            } else {
                await api.post(`/accounts/worker_profiles/${id}/approve/`);
            }
        },
        onSuccess: () => {
            toast.success('Account has been reactivated');
            queryClient.invalidateQueries({ queryKey: ['banned-users'] });
            setShowUnbanDialog(false);
        },
        onError: () => {
            toast.error('Failed to reactivate account');
        },
    });

    const handleUnban = () => {
        if (!selectedUser) return;
        unbanMutation.mutate({ id: selectedUser.id, type: selectedUser.type });
    };

    const columns = [
        { key: 'name', header: 'Name', sortable: true, render: (row: any) => row.name || row.phone || '-' },
        { key: 'email', header: 'Email', sortable: true, render: (row: any) => row.email || '-' },
        {
            key: 'type', header: 'Type', sortable: true,
            render: (row: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.type === 'Worker' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>{row.type}</span>
            ),
        },
        { key: 'status', header: 'Status', render: () => <StatusBadge status="suspended" /> },
        { key: 'phone', header: 'Phone', render: (row: any) => row.phone || '-' },
        {
            key: 'actions', header: 'Actions',
            render: (row: any) => (
                <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => { setSelectedUser(row); setShowUnbanDialog(true); }}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Reactivate
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="page-header">
                <h1 className="page-title">Banned Users & Workers</h1>
                <p className="page-subtitle">Manage suspended accounts</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <DataTable data={bannedUsers} columns={columns} loading={isLoading} searchPlaceholder="Search banned accounts..." />
            </div>

            <Dialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reactivate Account</DialogTitle>
                        <DialogDescription>Are you sure you want to reactivate this account? They will regain access immediately.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200 mb-4">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">Please ensure the issue that caused the suspension is resolved.</p>
                        </div>
                        <Label>Reason for Reactivation (Internal Note)</Label>
                        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional note..." className="mt-2" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUnbanDialog(false)}>Cancel</Button>
                        <Button onClick={handleUnban} disabled={unbanMutation.isPending}>
                            {unbanMutation.isPending ? 'Processing...' : 'Confirm Reactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BannedUsers;
