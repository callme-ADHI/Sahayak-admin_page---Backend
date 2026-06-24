import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

const BannedUsers = () => {
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showUnbanDialog, setShowUnbanDialog] = useState(false);
    const [reason, setReason] = useState('');

    const { data: bannedUsers = [], isLoading } = useQuery({
        queryKey: ['banned-users'],
        queryFn: async () => {
            // First get suspended users
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .eq('status', 'suspended');

            if (error) throw error;

            // Then get suspended workers
            const { data: workers, error: workerError } = await supabase
                .from('workers')
                .select('*')
                .eq('status', 'suspended');

            if (workerError) throw workerError;

            // Combine and tag them
            return [
                ...(users || []).map(u => ({ ...u, type: 'User' })),
                ...(workers || []).map(w => ({ ...w, type: 'Worker' }))
            ];
        }
    });

    const unbanMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string, type: string }) => {
            const table = type === 'User' ? 'users' : 'workers';
            const { error } = await supabase
                .from(table)
                .update({ status: 'active' })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('User has been unbanned');
            queryClient.invalidateQueries({ queryKey: ['banned-users'] });
            setShowUnbanDialog(false);
        },
        onError: () => {
            toast.error('Failed to unban user');
        }
    });

    const handleUnban = () => {
        if (!selectedUser) return;
        unbanMutation.mutate({ id: selectedUser.id, type: selectedUser.type });
    };

    const columns = [
        { key: 'name', header: 'Name', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        {
            key: 'type', header: 'Type', sortable: true, render: (row: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.type === 'Worker' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {row.type}
                </span>
            )
        },
        { key: 'status', header: 'Status', render: () => <StatusBadge status="suspended" /> },
        { key: 'phone', header: 'Phone' },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: any) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => {
                        setSelectedUser(row);
                        setShowUnbanDialog(true);
                    }}
                >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Unban
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
                <DataTable
                    data={bannedUsers}
                    columns={columns}
                    loading={isLoading}
                    searchPlaceholder="Search banned users..."
                />
            </div>

            <Dialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unban User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reactivate this account? They will regain access immediately.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200 mb-4">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">This user was previously suspended. Please ensure the issue is resolved.</p>
                        </div>

                        <Label>Reason for Unbanning (Internal Note)</Label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Optional note..."
                            className="mt-2"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUnbanDialog(false)}>Cancel</Button>
                        <Button onClick={handleUnban} disabled={unbanMutation.isPending}>
                            {unbanMutation.isPending ? 'Processing...' : 'Confirm Unban'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BannedUsers;
