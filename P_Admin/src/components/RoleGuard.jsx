import { Navigate } from 'react-router-dom';
import { useAuth, roleAccess } from '../context/AuthContext';

export default function RoleGuard({ page, children }) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    const allowed = roleAccess[user.role] || [];
    if (!allowed.includes(page)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
