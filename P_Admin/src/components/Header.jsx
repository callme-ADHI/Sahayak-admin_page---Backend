import { useState } from 'react';
import { Bell, Search, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleBadgeColors = {
    President: 'badge-blue',
    'Vice President': 'badge-green',
    Analytics: 'badge-yellow',
};

export default function Header({ pageTitle }) {
    const { user } = useAuth();
    const [showProfile, setShowProfile] = useState(false);

    return (
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm px-6 py-3 flex items-center justify-between">
            {/* Left: Page Title */}
            <div>
                <h1 className="text-lg font-bold text-gray-900">{pageTitle}</h1>
                <p className="text-xs text-gray-400">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-72">
                <Search size={15} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Search anything..."
                    className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
                />
            </div>

            {/* Right: Notif + Profile */}
            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Bell size={16} className="text-gray-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center"
                            style={{ background: '#1e3a5f' }}>
                            <User size={14} className="text-white" />
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-semibold text-gray-800">{user?.role}</p>
                            <p className="text-xs text-gray-400">{user?.phone}</p>
                        </div>
                        <ChevronDown size={13} className="text-gray-400" />
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-xs font-semibold text-gray-800">{user?.role}</p>
                                <p className="text-xs text-gray-400">{user?.phone}</p>
                            </div>
                            <div className="px-2 pt-2">
                                <span className={`badge ${roleBadgeColors[user?.role]}`}>{user?.role}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
