import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../../stores/hooks";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function VendorRoute({ children }: Props) {
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isVendor = user?.roles?.includes("Vendor");

  if (!isInitialized) return null;

  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${location.pathname}`} replace />;
  }

  if (!isVendor) {
    return <Navigate to="/" replace />;
  }

  return children;
}
