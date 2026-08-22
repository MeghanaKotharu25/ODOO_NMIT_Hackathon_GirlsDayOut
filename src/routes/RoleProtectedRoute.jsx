import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RoleProtectedRoute({ children, role = 'admin' }) {
	const { user, loading } = useAuth();

	if (loading) return null;
	if (!user) return <Navigate to="/login" replace />;

	const userRole = (user.profile?.role || user.role || '').toLowerCase();
	if (userRole !== role.toLowerCase()) return <Navigate to="/" replace />;

	return children || <Outlet />;
}

export default RoleProtectedRoute;
