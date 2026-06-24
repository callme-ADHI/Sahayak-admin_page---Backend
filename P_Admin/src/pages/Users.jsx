import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import { api } from '../services/api';
import { Search, Eye, UserX, CheckCircle } from 'lucide-react';

export default function Users() {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        api.getUsers().then(data => {
            setUsers(data || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search)
    );

    const handleSuspend = (id) => {
        api.updateUserStatus(id, 'suspended').then(() => {
            loadData();
        });
    };

    const handleActivate = (id) => {
        api.updateUserStatus(id, 'active').then(() => {
            loadData();
        });
    };

    const columns = [
        { key: 'id', label: 'User ID', render: v => <span className="font-mono text-xs text-gray-500">{v.substring(0,8)}</span> },
        { key: 'name', label: 'Name', render: v => <span className="font-semibold text-gray-900">{v}</span> },
        { key: 'phone', label: 'Phone', render: v => <span className="font-mono text-sm">{v}</span> },
        {
            key: 'cancellation_count', label: 'Cancellations', render: v => (
                <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg text-sm">{v}</span>
            )
        },
        {
            key: 'created_at', label: 'Registered On', render: v => (
                <span className="text-gray-500 text-sm">{v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
            )
        },
        {
            key: 'status', label: 'Status', render: v => (
                <span className={`badge ${v === 'active' ? 'badge-green' : 'badge-gray'}`}>{v}</span>
            )
        },
        {
            key: 'actions', label: 'Actions', render: (_, r) => (
                <div className="flex items-center gap-2">
                    {r.status === 'active' ? (
                        <button onClick={() => handleSuspend(r.id)} className="btn-danger py-1.5 px-3 text-xs flex items-center gap-1.5">
                            <UserX size={13} /> Suspend
                        </button>
                    ) : (
                        <button onClick={() => handleActivate(r.id)} className="btn-success py-1.5 px-3 text-xs flex items-center gap-1.5">
                            <CheckCircle size={13} /> Activate
                        </button>
                    )}
                </div>
            )
        },
    ];

    if (loading) {
        return (
            <Layout pageTitle="Platform Users">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 font-medium">Loading Users...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout pageTitle="Platform Users">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Users', value: users.length, color: '#1e3a5f' },
                    { label: 'Active Users', value: users.filter(u => u.status === 'active').length, color: '#22c55e' },
                    { label: 'Inactive Users', value: users.filter(u => u.status !== 'active').length, color: '#94a3b8' },
                    { label: 'Avg Cancellations', value: (users.reduce((a, u) => a + (u.cancellation_count || 0), 0) / (users.length || 1)).toFixed(1), color: '#7c3aed' },
                ].map(item => (
                    <div key={item.label} className="page-card p-4 text-center">
                        <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="flex gap-3 mb-5">
                <div className="relative flex-1 max-w-md">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        className="form-input pl-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="page-card">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">All Users</h2>
                    <span className="text-sm text-gray-400">{filtered.length} results</span>
                </div>
                <DataTable columns={columns} data={filtered} emptyMessage="No users found." />
            </div>
        </Layout>
    );
}
