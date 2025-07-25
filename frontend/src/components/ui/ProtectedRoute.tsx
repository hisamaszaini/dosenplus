import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';
import type { Role } from '../../types/user.types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

const ProtectedRoute = ({allowedRoles}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if(allowedRoles && !allowedRoles.includes(user.role)){
    return <Navigate to="/unathorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;