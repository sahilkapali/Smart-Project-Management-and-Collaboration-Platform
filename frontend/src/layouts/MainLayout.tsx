import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";

import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : "User";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* ===================================================== */}
      {/* SIDEBAR                                                */}
      {/* ===================================================== */}

      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ===================================================== */}
      {/* NAVBAR                                                 */}
      {/* ===================================================== */}

      <DashboardNavbar
        onMenuClick={() => setSidebarOpen(true)}
        userName={userName}
      />

      {/* ===================================================== */}
      {/* MAIN CONTENT                                           */}
      {/* ===================================================== */}

      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            md: "250px",
          },

          pt: {
            xs: "64px",
            md: "72px",
          },

          minHeight: "100vh",

          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },

          py: 3,
        }}
      >
        {/* Current route/page will be rendered here */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
