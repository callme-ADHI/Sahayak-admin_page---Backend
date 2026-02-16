import {
  Users,
  Briefcase,
  UserCheck,
  XCircle,
  TrendingUp,
  CreditCard,
  Activity,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useDashboardStats, useGrowthData, useCategoryVolume, useRecentActivity } from '@/hooks/useDashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface GrowthMetric {
  month: string;
  workers: number;
  users: number;
  works: number;
  revenue: number;
  payouts: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: growthData = [], isLoading: growthLoading } = useGrowthData(30);
  const { data: categoryData = [], isLoading: categoryLoading } = useCategoryVolume();
  const { data: recentActivity = [], isLoading: activityLoading } = useRecentActivity();

  const calculateGrowth = (current: number, previous: number) => {
    if (!previous || previous === 0) return { value: '0%', type: 'neutral' };
    const diff = ((current - previous) / previous) * 100;
    return {
      value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`,
      type: diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral'
    };
  };

  const growthList = growthData as GrowthMetric[];
  const currentMonth = growthList[growthList.length - 1] || {} as GrowthMetric;
  const prevMonth = growthList[growthList.length - 2] || {} as GrowthMetric;

  const workerGrowth = calculateGrowth(currentMonth.workers || 0, prevMonth.workers || 0);
  const userGrowth = calculateGrowth(currentMonth.users || 0, prevMonth.users || 0);

  if (statsLoading) {
    return (
      <div className="space-y-8 p-1">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Platform overview and performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            Live Data
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item} className="bg-white p-6 rounded border border-slate-200 shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Workers</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalWorkers || 0}</h3>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <span className={`flex items-center font-bold ${workerGrowth.type === 'positive' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {workerGrowth.type === 'positive' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : null}
              {workerGrowth.value}
            </span>
            <span className="text-slate-400 ml-1">vs last month</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded border border-slate-200 shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{stats?.totalUsers || 0}</h3>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <span className={`flex items-center font-bold ${userGrowth.type === 'positive' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {userGrowth.type === 'positive' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : null}
              {userGrowth.value}
            </span>
            <span className="text-slate-400 ml-1">vs last month</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded border border-slate-200 shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Works</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{stats?.activeWorks || 0}</h3>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <span className="text-slate-500 font-medium">Currently in progress</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded border border-slate-200 shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{stats?.completedWorks || 0}</h3>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <span className="text-slate-500 font-medium">All time volume</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={item} className="bg-white p-6 rounded border border-slate-200 shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Platform Growth</h3>
            <button className="text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-1 bg-slate-100 rounded">View Report</button>
          </div>
          <div className="h-80">
            {growthLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'none' }}
                  />
                  <Line type="monotone" dataKey="workers" stroke="#1e293b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="users" stroke="#64748b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded border border-slate-200 shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Work Categories</h3>
          </div>
          <div className="h-80">
            {categoryLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'none' }}
                  />
                  <Bar dataKey="count" fill="#334155" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
