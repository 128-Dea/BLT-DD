import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { UserRole } from "../utils/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedRoles &&
    currentUser.role &&
    !allowedRoles.includes(currentUser.role)
  ) {
    return (
      <Navigate
        to={
          currentUser.role === "perangkat_desa"
            ? "/dashboard-perangkat"
            : "/dashboard-kepala"
        }
        replace
      />
    );
  }

  return <>{children}</>;
}
