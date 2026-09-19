import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../../stores/hooks";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function AdminRoute({ children }: Props) {
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isAdmin = user?.roles?.includes("Admin");

  if (!isInitialized) return null;

  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${location.pathname}`} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
