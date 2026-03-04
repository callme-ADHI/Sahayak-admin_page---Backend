import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { useNavigate } from 'react-router-dom';

const unwrap = (data: any): any[] => data?.results ?? (Array.isArray(data) ? data : []);

const CancelledWorks = () => {
    const navigate = useNavigate();

    const { data: cancelledWorks = [], isLoading } = useQuery({
        queryKey: ['cancelled-works'],
        queryFn: async () => {
            // Django: jobs endpoint with job_status=cancelled
            const { data } = await api.get('/marketplace/jobs/', {
                params: { booking_status: 'cancelled' },
            });
            return unwrap(data);
        },
        retry: 1,
    });

    const columns = [
        { key: 'id', header: 'Work ID', render: (row: any) => <span className="font-mono text-xs">{row.id.slice(0, 8)}</span> },
        { key: 'category_name', header: 'Category', render: (row: any) => row.category_name || '-' },
        { key: 'user_name', header: 'Customer', render: (row: any) => row.user_name || row.user_phone || 'Unknown' },
        { key: 'worker_name', header: 'Worker', render: (row: any) => row.worker_name || 'Unassigned' },
        { key: 'scheduled_at', header: 'Date', sortable: true, render: (row: any) => row.scheduled_at ? new Date(row.scheduled_at).toLocaleDateString() : '-' },
        { key: 'final_price', header: 'Amount', sortable: true, render: (row: any) => row.final_price ? `₹${row.final_price}` : '-' },
        { key: 'job_status', header: 'Status', render: (row: any) => <StatusBadge status={row.job_status} /> },
        {
            key: 'actions', header: 'Actions',
            render: (row: any) => (
                <Button variant="outline" size="sm" onClick={() => navigate(`/works/detail/${row.id}`)}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="page-header">
                <h1 className="page-title">Cancelled Works</h1>
                <p className="page-subtitle">History of cancelled job requests</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <DataTable data={cancelledWorks} columns={columns} loading={isLoading} searchPlaceholder="Search cancelled works..." />
            </div>
        </div>
    );
};

export default CancelledWorks;
