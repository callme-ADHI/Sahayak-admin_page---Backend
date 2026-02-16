import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, MapPin, Calendar, CreditCard, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useBooking, useUpdateBookingStatus } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const WorkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: work, isLoading } = useBooking(id || '');
  const updateStatus = useUpdateBookingStatus();

  const handleComplete = async () => {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({ id, status: 'completed' });
      toast.success('Work marked as completed');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({ id, status: 'cancelled' });
      toast.success('Work cancelled');
    } catch (error) {
      toast.error('Failed to cancel work');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Work not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="page-title">{work.id.slice(0, 8)}</h1>
            <StatusBadge status={work.booking_status} />
          </div>
          <p className="page-subtitle">{work.category_name} Service</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reassign
          </Button>
          <Button 
            variant="outline" 
            className="text-success border-success hover:bg-success/10"
            onClick={handleComplete}
            disabled={updateStatus.isPending}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete
          </Button>
          <Button 
            variant="outline" 
            className="text-destructive border-destructive hover:bg-destructive/10"
            onClick={handleCancel}
            disabled={updateStatus.isPending}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Work Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Work ID</p>
                  <p className="font-medium">{work.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{work.category_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{work.duration_hours} hours</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={work.booking_status} />
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-sm">{work.notes || 'No additional notes'}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-5 h-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{(work as any).users?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{(work as any).users?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{(work as any).users?.email || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-5 h-5" />
                  Worker Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{(work as any).workers?.name || 'Unassigned'}</p>
                </div>
                {(work as any).workers && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{(work as any).workers?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{(work as any).workers?.email}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-5 h-5" />
                Work Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-3 h-3 rounded-full mt-1.5 bg-success" />
                  <div>
                    <p className="text-sm font-medium">Work Created</p>
                    <p className="text-xs text-muted-foreground">{new Date(work.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {work.accepted_at && (
                  <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full mt-1.5 bg-success" />
                    <div>
                      <p className="text-sm font-medium">Accepted</p>
                      <p className="text-xs text-muted-foreground">{new Date(work.accepted_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {work.started_at && (
                  <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full mt-1.5 bg-success" />
                    <div>
                      <p className="text-sm font-medium">Started</p>
                      <p className="text-xs text-muted-foreground">{new Date(work.started_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {work.completed_at && (
                  <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full mt-1.5 bg-success" />
                    <div>
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-xs text-muted-foreground">{new Date(work.completed_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-medium">₹{Number(work.price).toLocaleString()}</span>
              </div>
              {work.tip && Number(work.tip) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tip</span>
                  <span className="font-medium">₹{Number(work.tip).toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold">₹{(Number(work.price) + Number(work.tip || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-muted-foreground">Payment Status</span>
                <StatusBadge status={work.payment_status} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Service Date</p>
                <p className="font-medium">{work.service_date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Time</p>
                <p className="font-medium">{work.start_time}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{work.duration_hours} hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkDetail;
