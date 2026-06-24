import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import { api } from '../services/api';
import { Search, SlidersHorizontal, UserCheck, Clock, UserX, Star, Eye, CheckCircle, XCircle, FileText, X } from 'lucide-react';

const categories = ['All', 'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaner'];

function WorkerStatsBar({ counts }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
                { label: 'Total Workers', value: counts.total, color: '#1e3a5f' },
                { label: 'Pending Approval', value: counts.pending, color: '#f59e0b' },
                { label: 'Active Workers', value: counts.active, color: '#22c55e' },
                { label: 'Suspended', value: counts.suspended, color: '#ef4444' },
            ].map(item => (
                <div key={item.label} className="page-card p-4 text-center">
                    <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{item.label}</p>
                </div>
            ))}
        </div>
    );
}

function DocumentModal({ worker, onClose, onApprove }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{worker.name} – Documents</h3>
                        <p className="text-sm text-gray-400">{worker.category} · {worker.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {['Identity Proof (Aadhaar)', 'Skill Certification', 'Local Address Proof'].map(doc => (
                        <div key={doc} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <FileText size={18} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">{doc}</span>
                            </div>
                            <span className="badge badge-green">Uploaded</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 btn-secondary py-2.5 rounded-xl">Close</button>
                    <button onClick={() => { onApprove(worker.id); onClose(); }} className="flex-1 btn-primary py-2.5 rounded-xl">Approve Worker</button>
                </div>
            </div>
        </div>
    );
}

function ProfileModal({ worker, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-900 text-lg">Worker Profile</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                        style={{ background: '#1e3a5f' }}>
                        {worker.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-base">{worker.name}</p>
                        <p className="text-sm text-gray-500">{worker.category || 'General'}</p>
                        <p className="text-xs text-gray-400">{worker.phone}</p>
                    </div>
                    <div className="ml-auto">
                        <span className={`badge ${worker.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                            {worker.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label: 'Avg Rating', value: `⭐ ${worker.rating || 4.0}` },
                        { label: 'Experience', value: `${worker.experience_years || 5} Years` },
                        { label: 'Success Rate', value: '94%' },
                    ].map(m => (
                        <div key={m.label} className="text-center p-3 bg-gray-50 rounded-xl">
                            <p className="text-lg font-bold text-gray-900">{m.value}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
                        </div>
                    ))}
                </div>

                <button onClick={onClose} className="w-full btn-secondary py-2.5 rounded-xl">Close</button>
            </div>
        </div>
    );
}

export default function Workers() {
    const [tab, setTab] = useState('pending');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [docModal, setDocModal] = useState(null);
    const [profileModal, setProfileModal] = useState(null);
    
    const [pendingWorkers, setPendingWorkers] = useState([]);
    const [activeWorkers, setActiveWorkers] = useState([]);
    const [suspendedWorkers, setSuspendedWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        api.getWorkers().then(data => {
            setPendingWorkers(data.pending || []);
            setActiveWorkers(data.active || []);
            setSuspendedWorkers(data.suspended || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const filterBySearch = (list) =>
        list.filter(w =>
            (w.name.toLowerCase().includes(search.toLowerCase()) || w.id.toLowerCase().includes(search.toLowerCase())) &&
            (category === 'All' || w.category === category)
        );

    const handleApprove = (id) => {
        api.updateWorkerAction(id, 'approve').then(() => {
            loadData();
        });
    };

    const handleReject = (id) => {
        api.updateWorkerAction(id, 'reject').then(() => {
            loadData();
        });
    };

    const handleSuspend = (id) => {
        api.updateWorkerAction(id, 'suspend').then(() => {
            loadData();
        });
    };

    const handleReactivate = (id) => {
        api.updateWorkerAction(id, 'reactivate').then(() => {
            loadData();
        });
    };

    const pendingColumns = [
        { key: 'id', label: 'Worker ID', render: v => <span className="font-mono text-xs text-gray-500">{v.substring(0,8)}</span> },
        {
            key: 'name', label: 'Name', render: (v, r) => (
                <div>
                    <p className="font-semibold text-gray-900">{v}</p>
                    <p className="text-xs text-gray-400">{r.phone}</p>
                </div>
            )
        },
        { key: 'category', label: 'Category', render: v => <span className="badge badge-blue">{v || 'General'}</span> },
        { key: 'appliedDate', label: 'Applied On', render: (_, r) => <span>{r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}</span> },
        { key: 'status', label: 'Status', render: () => <span className="badge badge-yellow">Pending</span> },
        {
            key: 'actions', label: 'Actions', render: (_, r) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => handleApprove(r.id)} className="btn-success py-1.5 px-3 text-xs flex items-center gap-1">
                        <CheckCircle size={13} /> Approve
                    </button>
                    <button onClick={() => handleReject(r.id)} className="btn-danger py-1.5 px-3 text-xs flex items-center gap-1">
                        <XCircle size={13} /> Reject
                    </button>
                    <button onClick={() => setDocModal(r)} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1">
                        <FileText size={13} /> Docs
                    </button>
                </div>
            )
        },
    ];

    const activeColumns = [
        { key: 'id', label: 'Worker ID', render: v => <span className="font-mono text-xs text-gray-500">{v.substring(0,8)}</span> },
        {
            key: 'name', label: 'Name', render: (v, r) => (
                <div>
                    <p className="font-semibold text-gray-900">{v}</p>
                    <p className="text-xs text-gray-400">{r.phone}</p>
                </div>
            )
        },
        { key: 'category', label: 'Category', render: v => <span className="badge badge-blue">{v || 'General'}</span> },
        {
            key: 'rating', label: 'Rating', render: v => (
                <span className="flex items-center gap-1 font-semibold text-gray-800">
                    <Star size={13} className="text-yellow-400 fill-yellow-400" /> {v || 4.0}
                </span>
            )
        },
        { key: 'experience_years', label: 'Exp (Yrs)', render: v => <span className="font-semibold">{v}</span> },
        {
            key: 'status', label: 'Status', render: v => (
                <span className={`badge ${v === 'active' ? 'badge-green' : 'badge-gray'}`}>{v}</span>
            )
        },
        {
            key: 'actions', label: 'Actions', render: (_, r) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => setProfileModal(r)} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1">
                        <Eye size={13} /> Profile
                    </button>
                    <button onClick={() => handleSuspend(r.id)} className="btn-danger py-1.5 px-3 text-xs flex items-center gap-1">
                        <UserX size={13} /> Suspend
                    </button>
                </div>
            )
        },
    ];

    const suspendedColumns = [
        { key: 'id', label: 'Worker ID', render: v => <span className="font-mono text-xs text-gray-500">{v.substring(0,8)}</span> },
        {
            key: 'name', label: 'Name', render: (v, r) => (
                <div>
                    <p className="font-semibold text-gray-900">{v}</p>
                    <p className="text-xs text-gray-400">{r.phone}</p>
                </div>
            )
        },
        { key: 'category', label: 'Category', render: v => <span className="badge badge-blue">{v || 'General'}</span> },
        { key: 'status', label: 'Status', render: v => <span className="text-red-600 font-medium text-sm">{v}</span> },
        {
            key: 'actions', label: 'Actions', render: (_, r) => (
                <button onClick={() => handleReactivate(r.id)} className="btn-success py-1.5 px-3 text-xs flex items-center gap-1">
                    <CheckCircle size={13} /> Reactivate
                </button>
            )
        },
    ];

    const tabs = [
        { key: 'pending', label: 'Pending Approvals', icon: Clock, count: pendingWorkers.length, color: 'text-yellow-600' },
        { key: 'active', label: 'Active Workers', icon: UserCheck, count: activeWorkers.length, color: 'text-green-600' },
        { key: 'suspended', label: 'Suspended', icon: UserX, count: suspendedWorkers.length, color: 'text-red-500' },
    ];

    const currentData = {
        pending: filterBySearch(pendingWorkers),
        active: filterBySearch(activeWorkers),
        suspended: filterBySearch(suspendedWorkers),
    };

    if (loading) {
        return (
            <Layout pageTitle="Workers Management">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 font-medium">Loading Workers...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout pageTitle="Workers Management">
            <WorkerStatsBar counts={{
                total: pendingWorkers.length + activeWorkers.length + suspendedWorkers.length,
                pending: pendingWorkers.length,
                active: activeWorkers.length,
                suspended: suspendedWorkers.length,
            }} />

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        className="form-input pl-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-gray-400" />
                    <select
                        className="form-input"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Tabs + Table */}
            <div className="page-card">
                <div className="flex items-center gap-2 p-4 border-b border-gray-100 flex-wrap">
                    {tabs.map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.key}
                                id={`tab-${t.key}`}
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
                    columns={tab === 'pending' ? pendingColumns : tab === 'active' ? activeColumns : suspendedColumns}
                    data={currentData[tab]}
                    emptyMessage="No workers in this category."
                />
            </div>

            {docModal && <DocumentModal worker={docModal} onClose={() => setDocModal(null)} onApprove={handleApprove} />}
            {profileModal && <ProfileModal worker={profileModal} onClose={() => setProfileModal(null)} />}
        </Layout>
    );
}
