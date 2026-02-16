import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const CancelledWorks = () => {
    const navigate = useNavigate();

    const { data: cancelledWorks = [], isLoading } = useQuery({
        queryKey: ['cancelled-works'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          users (name, email),
          workers (name, email),
          category:categories (name)
        `)
                .eq('booking_status', 'cancelled')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    const columns = [
        { key: 'id', header: 'Work ID', render: (row: any) => <span className="font-mono text-xs">{row.id.slice(0, 8)}</span> },
        { key: 'category', header: 'Category', render: (row: any) => row.category?.name || row.category_name },
        { key: 'users', header: 'Customer', render: (row: any) => row.users?.name || 'Unknown' },
        { key: 'workers', header: 'Worker', render: (row: any) => row.workers?.name || 'Unassigned' },
        { key: 'service_date', header: 'Date', sortable: true, render: (row: any) => new Date(row.service_date).toLocaleDateString() },
        { key: 'price', header: 'Amount', sortable: true, render: (row: any) => `₹${row.price}` },
        { key: 'payment_status', header: 'Payment', render: (row: any) => <StatusBadge status={row.payment_status} /> },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: any) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/works/detail/${row.id}`)}
                >
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
                <DataTable
                    data={cancelledWorks}
                    columns={columns}
                    loading={isLoading}
                    searchPlaceholder="Search cancelled works..."
                />
            </div>
        </div>
    );
};

export default CancelledWorks;
