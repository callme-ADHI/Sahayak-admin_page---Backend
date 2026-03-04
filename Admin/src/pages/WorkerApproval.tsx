import { useState } from 'react';
import { Eye, Check, X, MessageSquare, FileText, Image, Download } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { usePendingVerifications, useWorkerStats, useApproveWorker, useRejectWorker } from '@/hooks/useWorkers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';

// Fetch verification requests for a worker from Django
const useWorkerVerificationRequests = (workerId: string | null) => {
  return useQuery({
    queryKey: ['worker-verification-requests', workerId],
    queryFn: async () => {
      if (!workerId) return [];
      const { data } = await api.get('/accounts/verification_requests/', {
        params: { worker: workerId },
      });
      return data?.results ?? (Array.isArray(data) ? data : []);
    },
    enabled: !!workerId,
    retry: 1,
  });
};

const WorkerApproval = () => {
  const { data: pendingWorkers = [], isLoading } = usePendingVerifications();
  const { data: stats } = useWorkerStats();
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  const approveWorker = useApproveWorker();
  const rejectWorker = useRejectWorker();

  // Verification requests for the selected worker (replaces Supabase verification_documents query)
  const { data: verificationRequests = [] } = useWorkerVerificationRequests(
    selectedWorker?.user_id ?? null
  );

  const handleApprove = async () => {
    if (!selectedWorker) return;
    try {
      await approveWorker.mutateAsync({ id: selectedWorker.user_id, adminNotes });
      toast.success('Worker approved successfully');
      setShowDetailModal(false);
      setAdminNotes('');
    } catch {
      toast.error('Failed to approve worker');
    }
  };

  const handleReject = async () => {
    if (!selectedWorker || !adminNotes) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await rejectWorker.mutateAsync({ id: selectedWorker.user_id, reason: adminNotes });
      toast.success('Worker application rejected');
      setShowDetailModal(false);
      setAdminNotes('');
    } catch {
      toast.error('Failed to reject worker');
    }
  };

  const handleRequestInfo = async () => {
    if (!requestMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    try {
      // Find the latest pending verification request and update it
      const pending = verificationRequests.find((r: any) => r.status === 'pending');
      if (pending) {
        await api.patch(`/accounts/verification_requests/${pending.id}/`, {
          admin_notes: requestMessage,
          status: 'pending',  // keep as pending, just add note
        });
      }
      toast.success('Information request logged');
      setShowRequestInfoModal(false);
      setRequestMessage('');
    } catch {
      toast.error('Failed to send request');
    }
  };

  const columns = [
    {
      key: 'avatar',
      header: '',
      render: (item: any) => (
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {item.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
          </AvatarFallback>
        </Avatar>
      ),
    },
    { key: 'user_id', header: 'Worker ID', sortable: true, render: (item: any) => <span className="font-mono text-xs">{item.user_id?.slice(0, 8)}</span> },
    { key: 'name', header: 'Name', sortable: true, render: (item: any) => item.name || '-' },
    { key: 'phone', header: 'Phone', render: (item: any) => item.phone || '-' },
    { key: 'email', header: 'Email', render: (item: any) => item.email || '-' },
    {
      key: 'worker_status',
      header: 'Status',
      render: (item: any) => <StatusBadge status={item.worker_status} />,
    },
    { key: 'created_at', header: 'Registered', sortable: true, render: (item: any) => new Date(item.created_at).toLocaleDateString() },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => (
        <Button variant="default" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedWorker(item); setShowDetailModal(true); }}>
          <Eye className="w-4 h-4 mr-1" />
          Review
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Worker Approval</h1>
          <p className="page-subtitle">Loading verification requests...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Worker Approval</h1>
        <p className="page-subtitle">Review and approve worker registrations (FIFO order)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-warning">{stats?.pending || pendingWorkers.length}</div><p className="text-sm text-muted-foreground">Pending Approvals</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-success">{stats?.verified || 0}</div><p className="text-sm text-muted-foreground">Verified Workers</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-destructive">{stats?.suspended || 0}</div><p className="text-sm text-muted-foreground">Suspended</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-primary">{stats?.total || 0}</div><p className="text-sm text-muted-foreground">Total Workers</p></CardContent></Card>
      </div>

      <DataTable
        data={pendingWorkers}
        columns={columns}
        searchPlaceholder="Search by ID, name, or phone..."
        onRowClick={(item) => { setSelectedWorker(item); setShowDetailModal(true); }}
      />

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Worker Approval Review</DialogTitle>
            <DialogDescription>Review worker details and documents before approval</DialogDescription>
          </DialogHeader>

          {selectedWorker && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Personal Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="action">Take Action</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedWorker.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedWorker.name || 'Unknown'}</h3>
                    <p className="text-muted-foreground">{selectedWorker.email || 'No email'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedWorker.phone || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Worker ID</Label>
                    <p className="font-medium font-mono">{selectedWorker.user_id?.slice(0, 12) || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Status</Label>
                    <StatusBadge status={selectedWorker.worker_status} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Registered</Label>
                    <p className="font-medium">{new Date(selectedWorker.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-muted-foreground">Bio</Label>
                    <p className="font-medium">{selectedWorker.bio || 'No bio provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Experience</Label>
                    <p className="font-medium">{selectedWorker.experience_years || 0} years</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Gov ID Type</Label>
                    <p className="font-medium capitalize">{selectedWorker.government_id_type || '-'}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verificationRequests.length > 0 ? verificationRequests.map((req: any) => (
                    <Card key={req.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm capitalize">{req.request_type?.replace('_', ' ')}</CardTitle>
                          <StatusBadge status={req.status} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Documents Submitted</Label>
                          <Badge variant="outline">
                            {Array.isArray(req.documents_submitted) ? req.documents_submitted.length : 0} files
                          </Badge>
                        </div>
                        {req.admin_notes && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Admin Notes</Label>
                            <p className="text-sm">{req.admin_notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No verification requests found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="action" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea
                    placeholder="Add notes about this application (required for rejection)..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setShowRequestInfoModal(true)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request More Info
                  </Button>
                  <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={handleReject} disabled={rejectWorker.isPending}>
                    <X className="w-4 h-4 mr-2" />
                    {rejectWorker.isPending ? 'Rejecting...' : 'Deny Application'}
                  </Button>
                  <Button className="bg-success hover:bg-success/90" onClick={handleApprove} disabled={approveWorker.isPending}>
                    <Check className="w-4 h-4 mr-2" />
                    {approveWorker.isPending ? 'Approving...' : 'Approve Worker'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Request Info Modal */}
      <Dialog open={showRequestInfoModal} onOpenChange={setShowRequestInfoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Additional Information</DialogTitle>
            <DialogDescription>Send a note requesting more information from the worker</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Message / Note</Label>
              <Textarea
                placeholder="Please provide additional information about..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestInfoModal(false)}>Cancel</Button>
            <Button onClick={handleRequestInfo}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerApproval;
