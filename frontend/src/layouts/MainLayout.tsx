import { useState } from "react";
import { Box } from "@mui/material";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";

import { useAuth } from "../context/AuthContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
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
      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Navbar */}
      <DashboardNavbar
        onMenuClick={() => setSidebarOpen(true)}
        userName={userName}
      />

      {/* Main Content */}
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
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
