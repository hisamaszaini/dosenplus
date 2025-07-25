import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';

const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (user) {
    const dashboardPath = `/${user.role.toLowerCase()}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;