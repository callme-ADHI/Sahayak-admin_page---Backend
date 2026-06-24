import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color = '#1e3a5f' }) {
    const isPositive = trend >= 0;

    return (
        <div className="stat-card">
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}15` }}
                >
                    <Icon size={22} style={{ color }} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value?.toLocaleString()}</p>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            {trendLabel && (
                <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>
            )}
        </div>
    );
}
