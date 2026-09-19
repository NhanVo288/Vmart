import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppSelector } from '../stores/hooks';

interface Props {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: Props) {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      toast.warning('You must login first');
    }
  }, [isAuthenticated, isInitialized]);

  if (!isInitialized) return null;

  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${location.pathname}`} replace />;
  }

  return children;
}
