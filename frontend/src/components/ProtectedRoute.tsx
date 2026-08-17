import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../utils/routes";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  const location = useLocation();

  // ==========================================
  // Wait for authentication restoration
  // ==========================================

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

  // ==========================================
  // Not authenticated
  // ==========================================

  if (!isAuthenticated) {
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

  // ==========================================
  // Authenticated
  // ==========================================

  return <Outlet />;
};

export default ProtectedRoute;
