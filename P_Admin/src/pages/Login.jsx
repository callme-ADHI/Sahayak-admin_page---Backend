import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Phone, Lock, ChevronDown, Eye, EyeOff } from 'lucide-react';

const roles = ['President', 'Vice President', 'Analytics'];

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('President');
    const [showPass, setShowPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            login(phone || '9876543210', password, role);
            navigate('/dashboard');
        }, 800);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div
                className="hidden lg:flex flex-col justify-between w-2/5 p-12"
                style={{ background: 'linear-gradient(160deg, #1e3a5f 0%, #152d4a 60%, #0d1f33 100%)' }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Building2 size={22} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-base">P-Admin</p>
                        <p className="text-white/40 text-xs">Panchayath Portal</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                        Manage Your<br />
                        Panchayath<br />
                        <span style={{ color: '#60a5fa' }}>Efficiently</span>
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                        A unified platform to monitor workers, manage jobs, handle complaints, and track analytics — all in one place.
                    </p>

                    <div className="mt-10 flex flex-col gap-4">
                        {[
                            { label: 'Workers Managed', value: '214+' },
                            { label: 'Daily Jobs', value: '50+' },
                            { label: 'Active Users', value: '1800+' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                    <span className="text-white/80 font-bold text-sm">{value}</span>
                                </div>
                                <span className="text-white/50 text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-white/20 text-xs">© 2026 Sahayak Panchayath System</p>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                            <Building2 size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">P-Admin</p>
                            <p className="text-gray-400 text-xs">Panchayath Portal</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
                            <p className="text-gray-400 text-sm">Sign in to access your admin dashboard</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="login-phone"
                                        type="tel"
                                        placeholder="Enter phone number"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="form-input pl-10"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="login-password"
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="form-input pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <div className="relative">
                                    <select
                                        id="login-role"
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        className="form-input appearance-none pr-8 cursor-pointer"
                                    >
                                        {roles.map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Role info box */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                <p className="text-xs text-blue-700 font-semibold mb-1">Role Access Preview</p>
                                <p className="text-xs text-blue-600">
                                    {role === 'Analytics'
                                        ? 'Dashboard, Analytics, Complaints & Reports'
                                        : 'Full access — Dashboard, Workers, Jobs, Users, Complaints & Analytics'
                                    }
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                id="login-btn"
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-3 rounded-xl text-base font-semibold mt-2 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                                        Signing in...
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-400 mt-6">
                            MVP prototype — any credentials will work
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
