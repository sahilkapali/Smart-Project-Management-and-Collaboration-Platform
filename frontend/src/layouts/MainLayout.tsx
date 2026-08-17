import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";

import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User"
    : "User";

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "background.default",
      }}
    >
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <DashboardSidebar open={sidebarOpen} onClose={handleCloseSidebar} />

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <DashboardNavbar onMenuClick={handleOpenSidebar} userName={userName} />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

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
          width: {
            xs: "100%",
            md: "calc(100% - 250px)",
          },

          boxSizing: "border-box",

          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },

          py: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
