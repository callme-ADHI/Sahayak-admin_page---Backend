import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import { api } from '../services/api';
import { Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Jobs() {
    const [tab, setTab] = useState('active');
    const [jobs, setJobs] = useState({ active: [], completed: [], disputed: [] });
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        api.getBookings().then(data => {
            setJobs(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const statusBadge = (status) => {
        const map = {
            'in_progress': 'badge-blue',
            'pending': 'badge-yellow',
            'completed': 'badge-green',
            'cancelled': 'badge-red',
            'disputed': 'badge-red',
        };
        return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
    };

    const activeColumns = [
        { key: 'id', label: 'Job ID', render: v => <span className="font-mono text-xs font-semibold text-gray-600">{v.substring(0,8)}</span> },
        { key: 'worker', label: 'Worker', render: v => <span className="font-medium">{v ? v.name : 'Unassigned'}</span> },
        { key: 'user', label: 'User', render: v => <span className="font-medium">{v ? v.name : 'Unknown'}</span> },
        { key: 'category_name', label: 'Category', render: v => <span className="badge badge-blue">{v}</span> },
        { key: 'status', label: 'Status', render: statusBadge },
        { key: 'booking_date', label: 'Date', render: v => <span className="text-gray-500 text-xs">{v}</span> },
    ];

    const completedColumns = [
        { key: 'id', label: 'Job ID', render: v => <span className="font-mono text-xs font-semibold text-gray-600">{v.substring(0,8)}</span> },
        { key: 'worker', label: 'Worker', render: v => <span className="font-medium">{v ? v.name : 'Unassigned'}</span> },
        { key: 'user', label: 'User', render: v => <span className="font-medium">{v ? v.name : 'Unknown'}</span> },
        { key: 'category_name', label: 'Category', render: v => <span className="badge badge-blue">{v}</span> },
        { key: 'booking_date', label: 'Date', render: v => <span className="text-gray-500 text-xs">{v}</span> },
    ];

    const disputedColumns = [
        { key: 'id', label: 'Job ID', render: v => <span className="font-mono text-xs font-semibold text-gray-600">{v.substring(0,8)}</span> },
        { key: 'worker', label: 'Worker', render: v => <span className="font-medium">{v ? v.name : 'Unassigned'}</span> },
        { key: 'user', label: 'User', render: v => <span className="font-medium">{v ? v.name : 'Unknown'}</span> },
        { key: 'description', label: 'Description', render: v => <span className="text-red-600 font-medium text-sm">{v}</span> },
        { key: 'status', label: 'Status', render: statusBadge },
    ];

    const tabs = [
        { key: 'active', label: 'Active Jobs', icon: Activity, count: jobs.active.length, color: 'text-blue-600' },
        { key: 'completed', label: 'Completed', icon: CheckCircle2, count: jobs.completed.length, color: 'text-green-600' },
        { key: 'disputed', label: 'Disputed & Cancelled', icon: AlertTriangle, count: jobs.disputed.length, color: 'text-red-500' },
    ];

    if (loading) {
        return (
            <Layout pageTitle="Jobs Management">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 font-medium">Loading Jobs...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout pageTitle="Jobs Management">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {tabs.map(t => {
                    const Icon = t.icon;
                    return (
                        <div key={t.key} className="page-card p-5 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.key === 'active' ? 'bg-blue-50' : t.key === 'completed' ? 'bg-green-50' : 'bg-red-50'
                                }`}>
                                <Icon size={22} className={t.color} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{jobs[t.key].length}</p>
                                <p className="text-sm text-gray-500">{t.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table */}
            <div className="page-card">
                <div className="flex items-center gap-2 p-4 border-b border-gray-100 flex-wrap">
                    {tabs.map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.key}
                                id={`jobs-tab-${t.key}`}
                                onClick={() => setTab(t.key)}
                                className={`tab-btn flex items-center gap-2 ${tab === t.key ? 'active' : ''}`}
                            >
                                <Icon size={14} className={tab === t.key ? 'text-white' : t.color} />
                                {t.label}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {jobs[t.key].length}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <DataTable columns={tab === 'active' ? activeColumns : tab === 'completed' ? completedColumns : disputedColumns} data={jobs[tab]} />
            </div>
        </Layout>
    );
}
