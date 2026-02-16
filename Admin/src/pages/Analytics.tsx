import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, Clock, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useGrowthData, useCategoryVolume, useDashboardStats } from '@/hooks/useDashboardStats';
import { usePaymentStats } from '@/hooks/usePayments';
import { Skeleton } from '@/components/ui/skeleton';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const days = parseInt(timeRange.replace('d', '')) || 30;

  const { data: stats } = useDashboardStats();
  const { data: paymentStats } = usePaymentStats();
  const { data: growthData = [], isLoading: growthLoading } = useGrowthData(days);
  const { data: categoryData = [], isLoading: categoryLoading } = useCategoryVolume();

  const handlePrint = () => {
    window.print();
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (!previous || previous === 0) return { value: '0%', trend: 'neutral' };
    const diff = ((current - previous) / previous) * 100;
    return {
      value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`,
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral'
    };
  };

  const defaultStats = { workers: 0, users: 0, works: 0, revenue: 0, payouts: 0 };
  const currentMonth = growthData[growthData.length - 1] || defaultStats;
  const prevMonth = growthData[growthData.length - 2] || defaultStats;

  const workerGrowth = calculateGrowth(currentMonth.workers, prevMonth.workers);
  const userGrowth = calculateGrowth(currentMonth.users, prevMonth.users);
  const workGrowth = calculateGrowth(currentMonth.works, prevMonth.works);
  const revenueGrowth = calculateGrowth(currentMonth.revenue, prevMonth.revenue);

  const kpiData = [
    { label: 'Total GMV', value: `₹${((paymentStats?.totalAmount || 0) / 100000).toFixed(1)}L`, change: revenueGrowth.value, trend: revenueGrowth.trend, icon: DollarSign },
    { label: 'Net Revenue', value: `₹${((paymentStats?.completedAmount || 0) / 100000).toFixed(2)}L`, change: revenueGrowth.value, trend: revenueGrowth.trend, icon: TrendingUp },
    { label: 'Active Workers', value: String(stats?.activeWorkers || 0), change: workerGrowth.value, trend: workerGrowth.trend, icon: Users },
    { label: 'Active Employers', value: String(stats?.activeUsers || 0), change: userGrowth.value, trend: userGrowth.trend, icon: Users },
    { label: 'Jobs Posted', value: String(stats?.activeWorks || 0), change: workGrowth.value, trend: workGrowth.trend, icon: Briefcase },
    { label: 'Jobs Completed', value: String(stats?.completedWorks || 0), change: workGrowth.value, trend: workGrowth.trend, icon: Clock },
    { label: 'Avg Job Value', value: `₹${paymentStats?.totalAmount && paymentStats?.total ? Math.round(paymentStats.totalAmount / paymentStats.total) : 0}`, change: '-', trend: 'neutral', icon: DollarSign },
    { label: 'Pending Payouts', value: `₹${((paymentStats?.pendingAmount || 0) / 1000).toFixed(0)}K`, change: '-', trend: 'neutral', icon: Clock },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Analytics & Growth</h1>
          <p className="page-subtitle">Platform performance and growth metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="180d">Last 6 months</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handlePrint}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #analytics-print-area, #analytics-print-area * {
            visibility: visible;
          }
          #analytics-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div id="analytics-print-area" className="space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    <p className={`text-sm mt-1 ${kpi.trend === 'up' ? 'text-success' :
                      kpi.trend === 'down' ? 'text-destructive' :
                        'text-muted-foreground'
                      }`}>
                      {kpi.change}
                    </p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <kpi.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {growthLoading ? (
                  <Skeleton className="h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v / 1000}K`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Revenue" />
                      <Area type="monotone" dataKey="payouts" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.2} name="Payouts" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {growthLoading ? (
                  <Skeleton className="h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line type="monotone" dataKey="workers" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Workers" />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Employers" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Volume Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {growthLoading ? (
                  <Skeleton className="h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="works" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Works" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center">
                {categoryLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="category"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </div>
              {categoryData.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {categoryData.map((entry, index) => (
                    <div key={entry.category} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs text-muted-foreground">{entry.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
