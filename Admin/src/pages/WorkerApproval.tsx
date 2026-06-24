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
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const useWorkerDocuments = (workerId: string | null) => {
  return useQuery({
    queryKey: ['worker-documents', workerId],
    queryFn: async () => {
      if (!workerId) return [];
      const { data, error } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('worker_id', workerId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!workerId,
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
  const { data: documents = [] } = useWorkerDocuments(selectedWorker?.worker_id || selectedWorker?.workers?.id);

  const handleApprove = async () => {
    if (!selectedWorker) return;
    try {
      await approveWorker.mutateAsync({ id: selectedWorker.id, adminNotes });
      toast.success('Worker approved successfully');
      setShowDetailModal(false);
      setAdminNotes('');
    } catch (error) {
      toast.error('Failed to approve worker');
    }
  };

  const handleReject = async () => {
    if (!selectedWorker || !adminNotes) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await rejectWorker.mutateAsync({ id: selectedWorker.id, reason: adminNotes });
      toast.success('Worker rejected');
      setShowDetailModal(false);
      setAdminNotes('');
    } catch (error) {
      toast.error('Failed to reject worker');
    }
  };

  const handleRequestInfo = async () => {
    if (!requestMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    // Update verification request with admin notes
    try {
      await supabase
        .from('verification_requests')
        .update({ 
          admin_notes: requestMessage,
          status: 'info_requested'
        })
        .eq('id', selectedWorker.id);
      
      toast.success('Information request sent to worker');
      setShowRequestInfoModal(false);
      setRequestMessage('');
      setShowDetailModal(false);
    } catch (error) {
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
            {item.workers?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
          </AvatarFallback>
        </Avatar>
      )
    },
    { key: 'id', header: 'Request ID', sortable: true, render: (item: any) => item.id.slice(0, 8) },
    { key: 'name', header: 'Name', sortable: true, render: (item: any) => item.workers?.name || '-' },
    { key: 'phone', header: 'Phone', render: (item: any) => item.workers?.phone || '-' },
    { key: 'email', header: 'Email', render: (item: any) => item.workers?.email || '-' },
    {
      key: 'request_type',
      header: 'Request Type',
      render: (item: any) => (
        <Badge variant="secondary" className="capitalize">{item.request_type?.replace('_', ' ')}</Badge>
      ),
    },
    {
      key: 'documents',
      header: 'Documents',
      render: (item: any) => {
        const docs = item.documents_submitted || [];
        return <Badge variant="outline">{Array.isArray(docs) ? docs.length : 0} files</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />,
    },
    { key: 'created_at', header: 'Submitted', sortable: true, render: (item: any) => new Date(item.created_at).toLocaleDateString() },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => (
        <Button
          variant="default"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedWorker(item);
            setShowDetailModal(true);
          }}
        >
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
        <h1 className="page-title">Worker Approval</h1>
        <p className="page-subtitle">Review and approve worker registrations (FIFO order)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">{stats?.pending || pendingWorkers.length}</div>
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{stats?.verified || 0}</div>
            <p className="text-sm text-muted-foreground">Verified Workers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{stats?.suspended || 0}</div>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{stats?.total || 0}</div>
            <p className="text-sm text-muted-foreground">Total Workers</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={pendingWorkers}
        columns={columns}
        searchPlaceholder="Search by ID, name, or phone..."
        onRowClick={(item) => {
          setSelectedWorker(item);
          setShowDetailModal(true);
        }}
      />

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Worker Approval Review</DialogTitle>
            <DialogDescription>
              Review worker details and documents before approval
            </DialogDescription>
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
                      {selectedWorker.workers?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedWorker.workers?.name || 'Unknown'}</h3>
                    <p className="text-muted-foreground">{selectedWorker.workers?.email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedWorker.workers?.phone || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Worker ID</Label>
                    <p className="font-medium font-mono">{selectedWorker.workers?.id?.slice(0, 12) || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Request Type</Label>
                    <Badge variant="secondary" className="capitalize">{selectedWorker.request_type?.replace('_', ' ')}</Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Submitted Date</Label>
                    <p className="font-medium">{new Date(selectedWorker.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-muted-foreground">Bio</Label>
                    <p className="font-medium">{selectedWorker.workers?.bio || 'No bio provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Experience</Label>
                    <p className="font-medium">{selectedWorker.workers?.experience_years || 0} years</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Languages</Label>
                    <div className="flex flex-wrap gap-1">
                      {(selectedWorker.workers?.languages || []).map((lang: string) => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.length > 0 ? documents.map((doc: any) => (
                    <Card key={doc.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm capitalize">{doc.document_type?.replace('_', ' ')}</CardTitle>
                          <StatusBadge status={doc.verification_status} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Document Number</Label>
                          <p className="font-mono text-sm">{doc.document_number || 'Not provided'}</p>
                        </div>
                        <div className="flex gap-2">
                          {doc.front_image_url && (
                            <div className="flex-1 aspect-video bg-muted rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <Image className="w-8 h-8 mx-auto text-muted-foreground" />
                                <p className="text-xs text-muted-foreground mt-1">Front</p>
                              </div>
                            </div>
                          )}
                          {doc.back_image_url && (
                            <div className="flex-1 aspect-video bg-muted rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <Image className="w-8 h-8 mx-auto text-muted-foreground" />
                                <p className="text-xs text-muted-foreground mt-1">Back</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="w-3 h-3 mr-1" />
                          Download Document
                        </Button>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No documents uploaded yet</p>
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
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRequestInfoModal(true);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request More Info
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={handleReject}
                    disabled={rejectWorker.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    {rejectWorker.isPending ? 'Rejecting...' : 'Deny Application'}
                  </Button>
                  <Button 
                    className="bg-success hover:bg-success/90"
                    onClick={handleApprove}
                    disabled={approveWorker.isPending}
                  >
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
            <DialogDescription>
              Send a message to the worker requesting more information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Message to Worker</Label>
              <Textarea
                placeholder="Please provide additional information about..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestInfoModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestInfo}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerApproval;
