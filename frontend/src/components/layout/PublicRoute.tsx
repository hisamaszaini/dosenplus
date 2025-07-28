import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';

const PublicRoute = () => {
  const { user, activeRole, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (user && activeRole) {
    const dashboardPath = `/${activeRole.toLowerCase()}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
