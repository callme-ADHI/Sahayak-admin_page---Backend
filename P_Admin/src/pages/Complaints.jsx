import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import { api } from '../services/api';
import { MessageSquareWarning, FileWarning } from 'lucide-react';

export default function Complaints() {
    const [tab, setTab] = useState('complaints');
    const [complaints, setComplaints] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        api.getComplaintsAndReports().then(data => {
            setComplaints(data.complaints || []);
            setReports(data.reports || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const updateComplaintStatus = (realId, newStatus) => {
        const mappedStatus = newStatus === 'Under Review' ? 'under_review' : 'resolved';
        api.updateReportStatus(realId, mappedStatus).then(() => {
            loadData();
        });
    };

    const statusBadge = (status) => {
        const map = {
            'Open': 'badge-red',
            'Under Review': 'badge-yellow',
            'Resolved': 'badge-green',
        };
        return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
    };

    const complaintColumns = [
        { key: 'id', label: 'Complaint ID', render: v => <span className="font-mono text-xs font-semibold text-gray-600">{v}</span> },
        { key: 'jobId', label: 'Job ID', render: v => <span className="font-mono text-xs text-gray-400">{v}</span> },
        { key: 'user', label: 'User', render: v => <span className="font-medium">{v}</span> },
        { key: 'worker', label: 'Worker', render: v => <span className="font-medium">{v}</span> },
        { key: 'type', label: 'Issue Type', render: v => <span className="text-red-600 font-medium text-sm">{v}</span> },
        { key: 'status', label: 'Status', render: statusBadge },
        {
            key: 'actions', label: 'Actions', render: (_, r) => (
                <div className="flex gap-2 flex-wrap">
                    {r.status !== 'Under Review' && r.status !== 'Resolved' && (
                        <button
                            onClick={() => updateComplaintStatus(r.realId, 'Under Review')}
                            className="btn-secondary py-1.5 px-3 text-xs"
                        >
                            Review
                        </button>
                    )}
                    {r.status !== 'Resolved' && (
                        <button
                            onClick={() => updateComplaintStatus(r.realId, 'Resolved')}
                            className="btn-success py-1.5 px-3 text-xs"
                        >
                            Resolve
                        </button>
                    )}
                </div>
            )
        },
    ];

    const reportColumns = [
        { key: 'id', label: 'Report ID', render: v => <span className="font-mono text-xs font-semibold text-gray-600">{v}</span> },
        { key: 'reporter', label: 'Reporter', render: v => <span className="font-medium">{v}</span> },
        { key: 'target', label: 'Target', render: v => <span className="font-medium text-gray-600">{v}</span> },
        { key: 'description', label: 'Description', render: v => <span className="text-sm text-gray-600 max-w-xs truncate block">{v}</span> },
        { key: 'date', label: 'Date' },
    ];

    const tabs = [
        { key: 'complaints', label: 'Complaints', icon: MessageSquareWarning, count: complaints.length, color: 'text-red-500' },
        { key: 'reports', label: 'Reports', icon: FileWarning, count: reports.length, color: 'text-orange-500' },
    ];

    // Summary
    const open = complaints.filter(c => c.status === 'Open').length;
    const under = complaints.filter(c => c.status === 'Under Review').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;

    if (loading) {
        return (
            <Layout pageTitle="Complaints & Reports">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 font-medium">Loading Complaints...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout pageTitle="Complaints & Reports">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Complaints', value: complaints.length, color: '#1e3a5f' },
                    { label: 'Open', value: open, color: '#ef4444' },
                    { label: 'Under Review', value: under, color: '#f59e0b' },
                    { label: 'Resolved', value: resolved, color: '#22c55e' },
                ].map(item => (
                    <div key={item.label} className="page-card p-4 text-center">
                        <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{item.label}</p>
                    </div>
                ))}
            </div>

            <div className="page-card">
                <div className="flex items-center gap-2 p-4 border-b border-gray-100">
                    {tabs.map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.key}
                                id={`complaints-tab-${t.key}`}
                                onClick={() => setTab(t.key)}
                                className={`tab-btn flex items-center gap-2 ${tab === t.key ? 'active' : ''}`}
                            >
                                <Icon size={14} className={tab === t.key ? 'text-white' : t.color} />
                                {t.label}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {t.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <DataTable
                    columns={tab === 'complaints' ? complaintColumns : reportColumns}
                    data={tab === 'complaints' ? complaints : reports}
                    emptyMessage="No items found."
                />
            </div>
        </Layout>
    );
}
