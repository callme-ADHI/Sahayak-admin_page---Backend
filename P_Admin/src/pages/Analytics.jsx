import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { analyticsData as dummyAnalyticsData, topWorkers as dummyTopWorkers } from '../data/dummyData';
import { Download, Briefcase, CheckCircle2, XCircle, MessageSquareWarning, UserCheck, Star } from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const FILTERS = ['Daily', 'Weekly', 'Monthly'];

export default function Analytics() {
    const [filter, setFilter] = useState('Weekly');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getDashboardStats().then(data => {
            // Map api response to analytics state structure
            const activeWorkers = data.activeWorkers || 0;
            const totalJobs = data.todayJobs || 0;
            const completedJobs = data.completedWorks || 0;
            const cancelledJobs = data.cancelledWorks || 0;
            const totalComplaints = data.openComplaints || 0;
            
            setStats({
                totalJobs,
                completedJobs,
                cancelledJobs,
                totalComplaints,
                activeWorkers,
                avgRating: 4.6,
                jobTrend: data.jobActivityData ? data.jobActivityData.map(j => ({ label: j.time, jobs: j.jobs })) : [],
                complaintTrend: [
                    { label: 'Mon', count: 1 },
                    { label: 'Tue', count: 0 },
                    { label: 'Wed', count: 2 },
                    { label: 'Thu', count: 1 },
                    { label: 'Fri', count: 0 },
                    { label: 'Sat', count: 1 },
                    { label: 'Sun', count: 0 }
                ]
            });
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const localData = stats || dummyAnalyticsData[filter.toLowerCase()];

    const handleDownload = (type) => {
        const content = `P-Admin Analytics Report\n${type} Log\nGenerated: ${new Date().toLocaleString('en-IN')}\n\nTotal Jobs: ${localData.totalJobs}\nCompleted: ${localData.completedJobs}\nCancelled: ${localData.cancelledJobs}\nComplaints: ${localData.totalComplaints}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type.toLowerCase()}-report.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const metricCards = [
        { label: 'Total Jobs', value: localData.totalJobs, icon: Briefcase, color: '#1e3a5f' },
        { label: 'Completed Jobs', value: localData.completedJobs, icon: CheckCircle2, color: '#22c55e' },
        { label: 'Cancelled Jobs', value: localData.cancelledJobs, icon: XCircle, color: '#ef4444' },
        { label: 'Total Complaints', value: localData.totalComplaints, icon: MessageSquareWarning, color: '#f59e0b' },
        { label: 'Active Workers', value: localData.activeWorkers, icon: UserCheck, color: '#7c3aed' },
        { label: 'Avg Rating', value: localData.avgRating, icon: Star, color: '#f59e0b' },
    ];

    if (loading) {
        return (
            <Layout pageTitle="Analytics">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 font-medium">Loading Analytics...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout pageTitle="Analytics">
            {/* Filter + Download */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            id={`filter-${f.toLowerCase()}`}
                            onClick={() => setFilter(f)}
                            className={`tab-btn ${filter === f ? 'active' : ''}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        id="download-daily"
                        onClick={() => handleDownload('Daily')}
                        className="btn-secondary flex items-center gap-2 py-2 px-4 rounded-xl"
                    >
                        <Download size={14} /> Daily Log
                    </button>
                    <button
                        id="download-weekly"
                        onClick={() => handleDownload('Weekly')}
                        className="btn-primary flex items-center gap-2 py-2 px-4 rounded-xl"
                    >
                        <Download size={14} /> Weekly Log
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                {metricCards.map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="stat-card text-center">
                            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                                style={{ background: `${card.color}15` }}>
                                <Icon size={18} style={{ color: card.color }} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{card.value?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
                {/* Job Trends */}
                <div className="page-card p-6">
                    <h3 className="font-bold text-gray-900 mb-1">Job Trends</h3>
                    <p className="text-xs text-gray-400 mb-5">{filter} job distribution</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={localData.jobTrend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                            <Bar dataKey="jobs" fill="#1e3a5f" radius={[6, 6, 0, 0]} name="Jobs" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Complaint Trends */}
                <div className="page-card p-6">
                    <h3 className="font-bold text-gray-900 mb-1">Complaint Trends</h3>
                    <p className="text-xs text-gray-400 mb-5">{filter} complaint volume</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={localData.complaintTrend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                            <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 5, fill: '#ef4444' }} name="Complaints" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Complaint Summary + Top Workers */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="page-card p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Complaint Summary</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Total Complaints', value: localData.totalComplaints, color: '#1e3a5f', percent: 100 },
                            { label: 'Resolved', value: 0, color: '#22c55e', percent: 0 },
                            { label: 'Pending', value: localData.totalComplaints, color: '#ef4444', percent: 100 },
                        ].map(item => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${item.percent}%`, background: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Workers */}
                <div className="page-card p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Top Performing Workers</h3>
                    <div className="space-y-3">
                        {dummyTopWorkers.map((w, i) => (
                            <div key={w.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300'
                                    }`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{w.name}</p>
                                    <p className="text-xs text-gray-400">{w.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" /> {w.rating}
                                    </p>
                                    <p className="text-xs text-gray-400">{w.jobs} jobs</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
