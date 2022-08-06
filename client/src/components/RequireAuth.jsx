import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { AuthContext } from '../providers/AuthProvider';

const RequireAuth = () => {
  const { authenticated, checking } = useContext(AuthContext);
  const location = useLocation();

  if (checking) return <p className="notice" role="status">Checking your session…</p>;
  if (!authenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
};

export default RequireAuth;
