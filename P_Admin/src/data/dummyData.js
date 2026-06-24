// Dummy data for P-Admin Dashboard

export const dashboardStats = {
    totalWorkers: 214,
    totalUsers: 1847,
    todayJobs: 53,
    openComplaints: 18,
};

export const recentActivities = [
    { id: 1, type: 'worker', message: 'Worker "Rahul Kumar" registered', time: '2 mins ago', icon: 'user-plus' },
    { id: 2, type: 'job', message: 'Job #349 created – Electrician service', time: '8 mins ago', icon: 'briefcase' },
    { id: 3, type: 'complaint', message: 'Complaint #78 submitted by Priya S.', time: '15 mins ago', icon: 'alert' },
    { id: 4, type: 'worker', message: 'Worker "Suresh M." approved', time: '22 mins ago', icon: 'check' },
    { id: 5, type: 'job', message: 'Job #346 completed – Plumber service', time: '35 mins ago', icon: 'briefcase' },
    { id: 6, type: 'user', message: 'New user "Anita Rao" registered', time: '1 hr ago', icon: 'user' },
    { id: 7, type: 'job', message: 'Job #340 disputed – Payment issue', time: '2 hrs ago', icon: 'alert' },
];

export const jobActivityData = [
    { time: '6AM', jobs: 3 },
    { time: '8AM', jobs: 8 },
    { time: '10AM', jobs: 15 },
    { time: '12PM', jobs: 22 },
    { time: '2PM', jobs: 18 },
    { time: '4PM', jobs: 25 },
    { time: '6PM', jobs: 19 },
    { time: '8PM', jobs: 11 },
];

export const workers = {
    pending: [
        { id: 'WRK-101', name: 'Arjun Nair', phone: '9876543210', category: 'Electrician', appliedDate: '2026-03-06', status: 'Pending' },
        { id: 'WRK-102', name: 'Meena Pillai', phone: '9871234560', category: 'Plumber', appliedDate: '2026-03-07', status: 'Pending' },
        { id: 'WRK-103', name: 'Santhosh R.', phone: '9860001112', category: 'Carpenter', appliedDate: '2026-03-07', status: 'Pending' },
        { id: 'WRK-104', name: 'Lakshmi V.', phone: '9845562318', category: 'Painter', appliedDate: '2026-03-08', status: 'Pending' },
        { id: 'WRK-105', name: 'Ravi Menon', phone: '9912345678', category: 'Electrician', appliedDate: '2026-03-08', status: 'Pending' },
    ],
    active: [
        { id: 'WRK-001', name: 'Rahul Kumar', phone: '9811223344', category: 'Electrician', rating: 4.8, totalJobs: 124, status: 'Active' },
        { id: 'WRK-002', name: 'Suresh Menon', phone: '9800112233', category: 'Plumber', rating: 4.6, totalJobs: 98, status: 'Active' },
        { id: 'WRK-003', name: 'Rani Das', phone: '9933445566', category: 'Painter', rating: 4.9, totalJobs: 210, status: 'Busy' },
        { id: 'WRK-004', name: 'Vijay K.', phone: '9822334455', category: 'Carpenter', rating: 4.3, totalJobs: 67, status: 'Offline' },
        { id: 'WRK-005', name: 'Priya Nambiar', phone: '9855667788', category: 'Cleaner', rating: 4.7, totalJobs: 155, status: 'Active' },
        { id: 'WRK-006', name: 'Deepak J.', phone: '9866778899', category: 'Electrician', rating: 4.5, totalJobs: 88, status: 'Active' },
    ],
    suspended: [
        { id: 'WRK-045', name: 'Manoj P.', phone: '9844556677', category: 'Plumber', reason: 'Customer Complaint', suspendedDate: '2026-02-28' },
        { id: 'WRK-067', name: 'Renu Krishnan', phone: '9877889900', category: 'Electrician', reason: 'Misconduct', suspendedDate: '2026-03-01' },
    ],
};

export const jobs = {
    active: [
        { id: 'JOB-349', worker: 'Rahul Kumar', user: 'Anil Sharma', category: 'Electrician', status: 'In Progress', startTime: '09:30 AM, Mar 8' },
        { id: 'JOB-348', worker: 'Priya Nambiar', user: 'Sunitha T.', category: 'Cleaner', status: 'Started', startTime: '10:00 AM, Mar 8' },
        { id: 'JOB-347', worker: 'Suresh Menon', user: 'Naresh P.', category: 'Plumber', status: 'In Progress', startTime: '11:15 AM, Mar 8' },
        { id: 'JOB-346', worker: 'Deepak J.', user: 'Kavitha M.', category: 'Electrician', status: 'Started', startTime: '12:00 PM, Mar 8' },
    ],
    completed: [
        { id: 'JOB-345', worker: 'Rani Das', user: 'Priya Rao', category: 'Painter', completionTime: '09:00 AM, Mar 8' },
        { id: 'JOB-344', worker: 'Vijay K.', user: 'Mohan Das', category: 'Carpenter', completionTime: '08:30 AM, Mar 8' },
        { id: 'JOB-343', worker: 'Rahul Kumar', user: 'Geetha S.', category: 'Electrician', completionTime: '07:45 AM, Mar 8' },
        { id: 'JOB-340', worker: 'Suresh Menon', user: 'Arjun T.', category: 'Plumber', completionTime: '06:30 PM, Mar 7' },
        { id: 'JOB-337', worker: 'Priya Nambiar', user: 'Rekha V.', category: 'Cleaner', completionTime: '05:00 PM, Mar 7' },
    ],
    disputed: [
        { id: 'JOB-338', worker: 'Manoj P.', user: 'Vikas R.', issue: 'Overcharging', status: 'Under Review' },
        { id: 'JOB-330', worker: 'Renu Krishnan', user: 'Deepa M.', issue: 'Poor Service Quality', status: 'Open' },
        { id: 'JOB-320', worker: 'Vijay K.', user: 'Sreeraj L.', issue: 'Incomplete Work', status: 'Resolved' },
    ],
};

export const users = [
    { id: 'USR-001', name: 'Anil Sharma', phone: '9811001100', totalJobs: 12, registeredDate: '2025-11-10', status: 'Active' },
    { id: 'USR-002', name: 'Sunitha T.', phone: '9822002200', totalJobs: 8, registeredDate: '2025-12-01', status: 'Active' },
    { id: 'USR-003', name: 'Naresh P.', phone: '9833003300', totalJobs: 5, registeredDate: '2026-01-15', status: 'Active' },
    { id: 'USR-004', name: 'Geetha S.', phone: '9844004400', totalJobs: 21, registeredDate: '2025-09-22', status: 'Active' },
    { id: 'USR-005', name: 'Priya Rao', phone: '9855005500', totalJobs: 3, registeredDate: '2026-02-10', status: 'Active' },
    { id: 'USR-006', name: 'Mohan Das', phone: '9866006600', totalJobs: 16, registeredDate: '2025-10-05', status: 'Inactive' },
    { id: 'USR-007', name: 'Arjun T.', phone: '9877007700', totalJobs: 7, registeredDate: '2026-01-30', status: 'Active' },
    { id: 'USR-008', name: 'Rekha V.', phone: '9888008800', totalJobs: 9, registeredDate: '2025-11-25', status: 'Active' },
];

export const complaints = [
    { id: 'CMP-078', jobId: 'JOB-338', user: 'Vikas R.', worker: 'Manoj P.', type: 'Overcharging', status: 'Under Review' },
    { id: 'CMP-077', jobId: 'JOB-330', user: 'Deepa M.', worker: 'Renu Krishnan', type: 'Poor Service', status: 'Open' },
    { id: 'CMP-076', jobId: 'JOB-320', user: 'Sreeraj L.', worker: 'Vijay K.', type: 'Incomplete Work', status: 'Resolved' },
    { id: 'CMP-075', jobId: 'JOB-310', user: 'Anitha R.', worker: 'Suresh Menon', type: 'Worker Misconduct', status: 'Open' },
    { id: 'CMP-074', jobId: 'JOB-305', user: 'Kavitha M.', worker: 'Deepak J.', type: 'Payment Dispute', status: 'Resolved' },
];

export const reports = [
    { id: 'RPT-012', reporter: 'Geetha S.', target: 'Renu Krishnan (Worker)', description: 'Rude behavior and threatening language', date: 'Mar 7, 2026' },
    { id: 'RPT-011', reporter: 'Mohan Das', target: 'Arjun T. (User)', description: 'Spam requests and fake job bookings', date: 'Mar 6, 2026' },
    { id: 'RPT-010', reporter: 'Priya Rao', target: 'Vijay K. (Worker)', description: 'Left job incomplete without refund', date: 'Mar 5, 2026' },
];

export const analyticsData = {
    daily: {
        totalJobs: 53,
        completedJobs: 41,
        cancelledJobs: 7,
        totalComplaints: 3,
        activeWorkers: 48,
        avgRating: 4.6,
        pendingComplaints: 2,
        resolvedComplaints: 1,
        jobTrend: [
            { label: '6AM', jobs: 3 },
            { label: '9AM', jobs: 12 },
            { label: '12PM', jobs: 18 },
            { label: '3PM', jobs: 22 },
            { label: '6PM', jobs: 15 },
            { label: '9PM', jobs: 8 },
        ],
        complaintTrend: [
            { label: '6AM', count: 0 },
            { label: '9AM', count: 1 },
            { label: '12PM', count: 2 },
            { label: '3PM', count: 3 },
            { label: '6PM', count: 3 },
            { label: '9PM', count: 3 },
        ],
    },
    weekly: {
        totalJobs: 312,
        completedJobs: 267,
        cancelledJobs: 28,
        totalComplaints: 18,
        activeWorkers: 52,
        avgRating: 4.5,
        pendingComplaints: 7,
        resolvedComplaints: 11,
        jobTrend: [
            { label: 'Mon', jobs: 42 },
            { label: 'Tue', jobs: 55 },
            { label: 'Wed', jobs: 38 },
            { label: 'Thu', jobs: 61 },
            { label: 'Fri', jobs: 48 },
            { label: 'Sat', jobs: 35 },
            { label: 'Sun', jobs: 33 },
        ],
        complaintTrend: [
            { label: 'Mon', count: 2 },
            { label: 'Tue', count: 4 },
            { label: 'Wed', count: 1 },
            { label: 'Thu', count: 5 },
            { label: 'Fri', count: 3 },
            { label: 'Sat', count: 2 },
            { label: 'Sun', count: 1 },
        ],
    },
    monthly: {
        totalJobs: 1248,
        completedJobs: 1082,
        cancelledJobs: 104,
        totalComplaints: 67,
        activeWorkers: 58,
        avgRating: 4.7,
        pendingComplaints: 18,
        resolvedComplaints: 49,
        jobTrend: [
            { label: 'Wk1', jobs: 290 },
            { label: 'Wk2', jobs: 320 },
            { label: 'Wk3', jobs: 340 },
            { label: 'Wk4', jobs: 298 },
        ],
        complaintTrend: [
            { label: 'Wk1', count: 14 },
            { label: 'Wk2', count: 18 },
            { label: 'Wk3', count: 22 },
            { label: 'Wk4', count: 13 },
        ],
    },
};

export const topWorkers = [
    { name: 'Rani Das', category: 'Painter', rating: 4.9, jobs: 210 },
    { name: 'Rahul Kumar', category: 'Electrician', rating: 4.8, jobs: 124 },
    { name: 'Priya Nambiar', category: 'Cleaner', rating: 4.7, jobs: 155 },
    { name: 'Suresh Menon', category: 'Plumber', rating: 4.6, jobs: 98 },
    { name: 'Deepak J.', category: 'Electrician', rating: 4.5, jobs: 88 },
];
