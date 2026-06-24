import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const login = (phone, password, role) => {
        setUser({ phone, role });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

// Role-based page access
export const roleAccess = {
    President: ['dashboard', 'workers', 'jobs', 'users', 'complaints', 'analytics'],
    'Vice President': ['dashboard', 'workers', 'jobs', 'users', 'complaints', 'analytics'],
    Analytics: ['dashboard', 'analytics', 'complaints'],
};
