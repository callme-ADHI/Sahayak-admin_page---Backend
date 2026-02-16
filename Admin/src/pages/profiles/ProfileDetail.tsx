import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Briefcase, CreditCard, Star, AlertTriangle, Ban, FileText } from 'lucide-react';
import { useUser, useSuspendUser, useBanUser, useActivateUser } from '@/hooks/useUsers';
import { useWorker } from '@/hooks/useWorkers';
import { useBookings } from '@/hooks/useBookings';
import { usePayments } from '@/hooks/usePayments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const ProfileDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  
  const isWorker = type === 'worker';
  const { data: user, isLoading: userLoading } = useUser(isWorker ? '' : id || '');
  const { data: worker, isLoading: workerLoading } = useWorker(isWorker ? id || '' : '');
  const { data: bookings = [] } = useBookings();
  const { data: payments = [] } = usePayments();

  const suspendUser = useSuspendUser();
  const banUser = useBanUser();
  const activateUser = useActivateUser();

  const isLoading = isWorker ? workerLoading : userLoading;
  const profile = isWorker ? worker : user;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const userBookings = bookings.filter((b: any) => 
    isWorker ? b.worker_id === id : b.user_id === id
  );

  const userPayments = payments.filter((p: any) =>
    isWorker ? p.worker_id === id : p.user_id === id
  );

  const handleSuspend = async () => {
    if (!id) return;
    try {
      await suspendUser.mutateAsync(id);
      toast.success('User suspended');
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  const handleBan = async () => {
    if (!id) return;
    try {
      await banUser.mutateAsync(id);
      toast.success('User banned');
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {profile.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{profile.name}</h1>
              <StatusBadge status={profile.status} />
            </div>
            <p className="page-subtitle">{isWorker ? 'Worker' : 'Employer'} • {profile.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Warn
          </Button>
          <Button 
            variant="outline" 
            className="text-warning border-warning hover:bg-warning/10"
            onClick={handleSuspend}
            disabled={suspendUser.isPending}
          >
            Suspend
          </Button>
          <Button 
            variant="outline" 
            className="text-destructive border-destructive hover:bg-destructive/10"
            onClick={handleBan}
            disabled={banUser.isPending}
          >
            <Ban className="w-4 h-4 mr-2" />
            Ban
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{profile.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{profile.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {isWorker && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-5 h-5" />
                  Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <StatusBadge status={(worker as any)?.verification_status || 'pending'} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verified</span>
                  <Badge variant={(worker as any)?.is_verified ? 'default' : 'secondary'}>
                    {(worker as any)?.is_verified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {isWorker && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Star className="w-5 h-5" />
                  Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {(worker as any)?.average_rating?.toFixed(1) || '0.0'}
                  </span>
                  <div className="flex text-warning">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= Math.round((worker as any)?.average_rating || 0) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {(worker as any)?.rating_count || 0} reviews
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="works">
            <TabsList>
              <TabsTrigger value="works">
                <Briefcase className="w-4 h-4 mr-2" />
                Work History
              </TabsTrigger>
              <TabsTrigger value="payments">
                <CreditCard className="w-4 h-4 mr-2" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="complaints">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Complaints
              </TabsTrigger>
            </TabsList>

            <TabsContent value="works" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Work ID</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userBookings.length > 0 ? userBookings.map((booking: any) => (
                        <tr key={booking.id} className="cursor-pointer" onClick={() => navigate(`/works/detail/${booking.id}`)}>
                          <td>{booking.id.slice(0, 8)}</td>
                          <td>{booking.category_name}</td>
                          <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                          <td><StatusBadge status={booking.booking_status} /></td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-muted-foreground">
                            No work history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userPayments.length > 0 ? userPayments.map((payment: any) => (
                        <tr key={payment.id}>
                          <td>{payment.id.slice(0, 8)}</td>
                          <td>₹{Number(payment.amount).toLocaleString()}</td>
                          <td>{payment.payment_method}</td>
                          <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td><StatusBadge status={payment.status} /></td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            No payment history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="complaints" className="mt-4">
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No complaints against this user
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
