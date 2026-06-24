import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RoleGuard from './components/RoleGuard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Jobs from './pages/Jobs';
import Users from './pages/Users';
import Complaints from './pages/Complaints';
import Analytics from './pages/Analytics';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <PrivateRoute><RoleGuard page="dashboard"><Dashboard /></RoleGuard></PrivateRoute>
      } />
      <Route path="/workers" element={
        <PrivateRoute><RoleGuard page="workers"><Workers /></RoleGuard></PrivateRoute>
      } />
      <Route path="/jobs" element={
        <PrivateRoute><RoleGuard page="jobs"><Jobs /></RoleGuard></PrivateRoute>
      } />
      <Route path="/users" element={
        <PrivateRoute><RoleGuard page="users"><Users /></RoleGuard></PrivateRoute>
      } />
      <Route path="/complaints" element={
        <PrivateRoute><RoleGuard page="complaints"><Complaints /></RoleGuard></PrivateRoute>
      } />
      <Route path="/analytics" element={
        <PrivateRoute><RoleGuard page="analytics"><Analytics /></RoleGuard></PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
