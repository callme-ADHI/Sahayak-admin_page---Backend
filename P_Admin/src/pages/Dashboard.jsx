import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { Users, UserCheck, Briefcase, MessageSquareWarning, Activity, ArrowRight } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const activityTypeColors = {
    worker: { bg: '#dbeafe', color: '#1d4ed8' },
    job: { bg: '#dcfce7', color: '#16a34a' },
    complaint: { bg: '#fee2e2', color: '#dc2626' },
    user: { bg: '#f3e8ff', color: '#9333ea' },
};

const activityIcons = {
    worker: UserCheck,
    job: Briefcase,
    complaint: MessageSquareWarning,
    user: Users,
};

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalWorkers: 0,
        totalUsers: 0,
        todayJobs: 0,
        openComplaints: 0,
        activeWorks: 0,
        pendingRequests: 0,
        pendingApprovals: 0,
        activeWorkers: 0
    });
    const [jobActivityData, setJobActivityData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getDashboardStats().then(data => {
            setStats({
                totalWorkers: data.totalWorkers || 0,
                totalUsers: data.totalUsers || 0,
                todayJobs: data.todayJobs || 0,
                openComplaints: data.openComplaints || 0,
                activeWorks: data.activeWorks || 0,
                pendingRequests: data.pendingRequests || 0,
                pendingApprovals: data.pendingApprovals || 0,
                activeWorkers: data.activeWorkers || 0
            });
            setJobActivityData(data.jobActivityData || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const statCards = [
        { title: 'Total Workers', value: stats.totalWorkers, icon: UserCheck, trend: 8, trendLabel: 'vs last month', color: '#1e3a5f' },
        { title: 'Total Users', value: stats.totalUsers, icon: Users, trend: 12, trendLabel: 'vs last month', color: '#7c3aed' },
        { title: "Today's Jobs", value: stats.todayJobs, icon: Briefcase, trend: 5, trendLabel: 'vs yesterday', color: '#0891b2' },
        { title: 'Open Complaints', value: stats.openComplaints, icon: MessageSquareWarning, trend: -3, trendLabel: 'vs yesterday', color: '#dc2626' },
    ];

    const recentActivitiesMock = [
        { id: 1, type: 'worker', message: 'Worker registration synchronized', time: 'Just now' },
        { id: 2, type: 'job', message: 'Job status checked with backend', time: '1 min ago' },
        { id: 3, type: 'complaint', message: 'Resolved complaint sync', time: '5 mins ago' }
    ];

    if (loading) {
        return (
            <Layout pageTitle="Dashboard">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 font-medium">Loading Dashboard Data...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout pageTitle="Dashboard">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                {statCards.map(s => (
                    <StatCard key={s.title} {...s} />
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Job Activity Chart */}
                <div className="xl:col-span-2 page-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="font-bold text-gray-900">Job Activity</h2>
                            <p className="text-xs text-gray-400">Today's job distribution by hour</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg">
                            <Activity size={13} />
                            Live
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={jobActivityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                labelStyle={{ fontWeight: 600, color: '#0f172a' }}
                            />
                            <Area type="monotone" dataKey="jobs" stroke="#1e3a5f" strokeWidth={2.5} fill="url(#jobGrad)" dot={{ r: 4, fill: '#1e3a5f' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Activity */}
                <div className="page-card p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold text-gray-900">Recent Activity</h2>
                        <button className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                            View all <ArrowRight size={12} />
                        </button>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto">
                        {recentActivitiesMock.map(activity => {
                            const Icon = activityIcons[activity.type] || Activity;
                            const style = activityTypeColors[activity.type] || activityTypeColors.job;
                            return (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div
                                        className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                                        style={{ background: style.bg }}
                                    >
                                        <Icon size={14} style={{ color: style.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 leading-snug">{activity.message}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Stats Bottom Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                {[
                    { label: 'Pending Approvals', value: stats.pendingApprovals, color: '#f59e0b' },
                    { label: 'Active Jobs Right Now', value: stats.activeWorks, color: '#22c55e' },
                    { label: 'Suspended Workers', value: stats.totalWorkers - stats.activeWorkers - stats.pendingApprovals, color: '#ef4444' },
                    { label: 'Total Pending requests', value: stats.pendingRequests, color: '#1e3a5f' },
                ].map(item => (
                    <div key={item.label} className="page-card p-4 text-center">
                        <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{item.label}</p>
                    </div>
                ))}
            </div>
        </Layout>
    );
}
