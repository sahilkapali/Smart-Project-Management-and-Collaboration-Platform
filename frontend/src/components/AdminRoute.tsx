import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  const location = useLocation();

  // ============================================================
  // WAIT FOR AUTHENTICATION RESTORATION
  // ============================================================

  if (loading) {
    return null;
  }

  // ============================================================
  // NOT AUTHENTICATED
  // ============================================================

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ============================================================
  // ADMIN ONLY
  // ============================================================

  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // ============================================================
  // AUTHORIZED
  // ============================================================

  return <Outlet />;
};

export default AdminRoute;
