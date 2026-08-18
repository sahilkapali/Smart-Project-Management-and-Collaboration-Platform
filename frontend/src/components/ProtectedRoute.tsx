import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Box, CircularProgress, Typography } from "@mui/material";

import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../utils/routes";

const ProtectedRoute = () => {
  const { user, token, loading } = useAuth();

  const location = useLocation();

  // ============================================================
  // WAIT FOR AUTHENTICATION RESTORATION
  // ============================================================
  //
  // AuthContext needs time to:
  //
  // 1. Read the stored JWT
  // 2. Validate the JWT with the backend
  // 3. Load the current user
  //
  // We must NOT redirect to login while this is happening.
  //
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />

        <Typography variant="body2" color="text.secondary">
          Restoring your session...
        </Typography>
      </Box>
    );
  }

  // ============================================================
  // AUTHENTICATION CHECK
  // ============================================================
  //
  // A protected page requires BOTH:
  //
  // - a valid token
  // - a loaded authenticated user
  //
  // ============================================================

  const authenticated = Boolean(token && user);

  // ============================================================
  // NOT AUTHENTICATED
  // ============================================================

  if (!authenticated) {
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

  // ============================================================
  // AUTHENTICATED
  // ============================================================

  return <Outlet />;
};

export default ProtectedRoute;
