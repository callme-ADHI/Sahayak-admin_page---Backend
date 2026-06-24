import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, roleAccess } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Briefcase, UserCheck,
    MessageSquareWarning, BarChart3, LogOut, ChevronLeft,
    ChevronRight, Building2
} from 'lucide-react';

const allNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { key: 'workers', label: 'Workers', icon: UserCheck, path: '/workers' },
    { key: 'jobs', label: 'Jobs', icon: Briefcase, path: '/jobs' },
    { key: 'users', label: 'Users', icon: Users, path: '/users' },
    { key: 'complaints', label: 'Complaints & Reports', icon: MessageSquareWarning, path: '/complaints' },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const allowed = user ? roleAccess[user.role] : [];

    const navItems = allNavItems.filter(item => allowed.includes(item.key));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside
            className="sidebar flex flex-col h-screen sticky top-0 transition-all duration-300 z-30"
            style={{ width: collapsed ? '72px' : '240px', minWidth: collapsed ? '72px' : '240px' }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Building2 size={20} className="text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-white font-bold text-sm leading-tight">P-Admin</p>
                        <p className="text-white/50 text-xs">Panchayath Portal</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
                {!collapsed && (
                    <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Menu</p>
                )}
                {navItems.map(({ key, label, icon: Icon, path }) => (
                    <NavLink
                        key={key}
                        to={path}
                        className={({ isActive }) =>
                            `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
                        }
                        title={collapsed ? label : undefined}
                    >
                        <Icon size={18} className="flex-shrink-0" />
                        {!collapsed && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="border-t border-white/10 p-3">
                {!collapsed && user && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {user.phone?.slice(-2)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white text-xs font-semibold truncate">{user.role}</p>
                            <p className="text-white/40 text-xs truncate">{user.phone}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className={`sidebar-item w-full ${collapsed ? 'justify-center' : ''} hover:bg-red-500/20`}
                    title="Logout"
                >
                    <LogOut size={18} className="text-red-400 flex-shrink-0" />
                    {!collapsed && <span className="text-red-400">Logout</span>}
                </button>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            >
                {collapsed
                    ? <ChevronRight size={13} className="text-gray-500" />
                    : <ChevronLeft size={13} className="text-gray-500" />
                }
            </button>
        </aside>
    );
}
