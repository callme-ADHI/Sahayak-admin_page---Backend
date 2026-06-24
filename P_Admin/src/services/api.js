const BASE_URL = 'http://localhost:8000/api';

export const api = {
    async getDashboardStats() {
        const res = await fetch(`${BASE_URL}/analytics/`);
        return res.json();
    },

    async getWorkers() {
        const res = await fetch(`${BASE_URL}/workers/`);
        const data = await res.json();
        return {
            pending: data.filter(w => !w.verified),
            active: data.filter(w => w.verified && w.status !== 'suspended' && w.status !== 'banned'),
            suspended: data.filter(w => w.status === 'suspended' || w.status === 'banned')
        };
    },

    async getUsers() {
        const res = await fetch(`${BASE_URL}/users/`);
        return res.json();
    },

    async getBookings() {
        const res = await fetch(`${BASE_URL}/bookings/`);
        const data = await res.json();
        return {
            active: data.filter(b => b.status === 'in_progress' || b.status === 'pending' || b.status === 'accepted'),
            completed: data.filter(b => b.status === 'completed'),
            disputed: data.filter(b => b.status === 'disputed' || b.status === 'cancelled')
        };
    },

    async getComplaintsAndReports() {
        const res = await fetch(`${BASE_URL}/reports/`);
        const data = await res.json();
        return {
            complaints: data.map(r => ({
                id: `CMP-${r.id.substring(0,4).toUpperCase()}`,
                realId: r.id,
                jobId: `JOB-${r.booking_id.substring(0,4).toUpperCase()}`,
                user: r.raised_by.name,
                worker: r.booking_worker ? r.booking_worker.name : 'Unknown',
                type: 'Dispute',
                status: r.status === 'open' ? 'Open' : r.status === 'under_review' ? 'Under Review' : 'Resolved'
            })),
            reports: data.map(r => ({
                id: `RPT-${r.id.substring(0,4).toUpperCase()}`,
                realId: r.id,
                reporter: r.raised_by.name,
                target: 'Worker',
                description: r.description,
                date: new Date(r.created_at).toLocaleDateString('en-IN')
            }))
        };
    },

    async updateWorkerAction(id, action) {
        const res = await fetch(`${BASE_URL}/workers/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action })
        });
        return res.json();
    },

    async updateUserStatus(id, status) {
        const res = await fetch(`${BASE_URL}/users/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        return res.json();
    },

    async updateBookingStatus(id, status) {
        const res = await fetch(`${BASE_URL}/bookings/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        return res.json();
    },

    async updateReportStatus(id, status) {
        const res = await fetch(`${BASE_URL}/reports/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        return res.json();
    }
};
