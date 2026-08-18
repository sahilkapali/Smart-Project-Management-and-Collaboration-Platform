import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "../../context/AuthContext";

import type { UserRole } from "../../types/user.types";

import { ROUTES } from "../../utils/routes";

// ============================================================
// PROPS
// ============================================================

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

// ============================================================
// ROLE PROTECTED ROUTE
// ============================================================

const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();

  const location = useLocation();

  // ==========================================================
  // WAIT FOR AUTHENTICATION
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ==========================================================
  // NOT AUTHENTICATED
  // ==========================================================

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // ==========================================================
  // CHECK ROLE
  // ==========================================================

  const hasPermission = allowedRoles.includes(user.role);

  // ==========================================================
  // USER DOES NOT HAVE REQUIRED ROLE
  // ==========================================================

  if (!hasPermission) {
    /*
     * The user is authenticated, but does not
     * have permission to access this page.
     *
     * We do NOT send them to /login because
     * they are already authenticated.
     */

    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // ==========================================================
  // AUTHORIZED
  // ==========================================================

  return <Outlet />;
};

export default RoleProtectedRoute;
