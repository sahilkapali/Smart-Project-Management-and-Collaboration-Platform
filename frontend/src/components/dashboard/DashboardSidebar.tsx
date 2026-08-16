import { useState } from "react";
import type { ReactNode } from "react";

import {
  Box,
  ButtonBase,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";

import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../utils/routes";

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
    icon: <DashboardRoundedIcon />,
  },
  {
    label: "Projects",
    path: "/projects",
    icon: <FolderRoundedIcon />,
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: <TaskAltRoundedIcon />,
  },
  {
    label: "Team Members",
    path: "/teams",
    icon: <GroupsRoundedIcon />,
  },
  {
    label: "Meetings",
    path: "/meetings",
    icon: <EventRoundedIcon />,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: <AssessmentRoundedIcon />,
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: <CalendarMonthRoundedIcon />,
  },
  {
    label: "Notifications",
    path: ROUTES.NOTIFICATIONS,
    icon: <NotificationsRoundedIcon />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsRoundedIcon />,
  },
];

const DashboardSidebar = ({ open = true, onClose }: DashboardSidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useAuth();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [loggingOut, setLoggingOut] = useState(false);

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleNavigation = (path: string) => {
    navigate(path);

    if (isMobile) {
      onClose?.();
    }
  };

  // =========================================================
  // ACTIVE ITEM
  // =========================================================

  const isActive = (path: string) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === ROUTES.DASHBOARD;
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      if (isMobile) {
        onClose?.();
      }

      await logout();

      toast.success("Logged out successfully.");

      navigate(ROUTES.LOGIN, {
        replace: true,
      });
    } catch (error) {
      console.error("Logout error:", error);

      toast.error("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  // =========================================================
  // MOBILE CLOSED
  // =========================================================

  if (isMobile && !open) {
    return null;
  }

  return (
    <>
      {/* ===================================================== */}
      {/* MOBILE OVERLAY                                        */}
      {/* ===================================================== */}

      {isMobile && open && (
        <Box
          onClick={onClose}
          sx={{
            position: "fixed",
            inset: 0,

            bgcolor: "rgba(0, 0, 0, 0.35)",

            zIndex: theme.zIndex.drawer - 1,
          }}
        />
      )}

      {/* ===================================================== */}
      {/* SIDEBAR                                               */}
      {/* ===================================================== */}

      <Paper
        elevation={0}
        square
        sx={{
          position: "fixed",

          top: 0,
          left: 0,
          bottom: 0,

          width: {
            xs: 280,
            md: 250,
          },

          zIndex: theme.zIndex.drawer,

          display: "flex",
          flexDirection: "column",

          bgcolor: "primary.main",
          color: "primary.contrastText",

          borderRadius: {
            xs: 0,
            md: "0 18px 18px 0",
          },

          transform: {
            xs: open ? "translateX(0)" : "translateX(-100%)",

            md: "translateX(0)",
          },

          transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.shorter,
          }),

          overflow: "hidden",
        }}
      >
        {/* ================================================= */}
        {/* BRAND                                             */}
        {/* ================================================= */}

        <Box
          sx={{
            flexShrink: 0,

            px: 2.5,
            pt: 3,
            pb: 2.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {/* Logo */}

            <Box
              sx={{
                width: 42,
                height: 42,

                flexShrink: 0,

                borderRadius: 2,

                bgcolor: "rgba(255,255,255,0.16)",

                border: "1px solid rgba(255,255,255,0.22)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                fontWeight: 800,
                fontSize: 18,
              }}
            >
              S
            </Box>

            {/* Brand name */}

            <Box sx={{ flex: 1 }}>
              <Typography
                fontWeight={800}
                lineHeight={1.15}
                sx={{
                  fontSize: 16,
                }}
              >
                Smart Project
              </Typography>

              <Typography
                fontWeight={500}
                lineHeight={1.15}
                sx={{
                  fontSize: 15,
                  opacity: 0.9,
                }}
              >
                Management
              </Typography>
            </Box>

            {/* Mobile close */}

            {isMobile && (
              <ButtonBase
                onClick={onClose}
                aria-label="Close navigation"
                sx={{
                  width: 36,
                  height: 36,

                  flexShrink: 0,

                  borderRadius: 2,

                  color: "inherit",

                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.10)",
                  },
                }}
              >
                <CloseRoundedIcon />
              </ButtonBase>
            )}
          </Stack>
        </Box>

        {/* ================================================= */}
        {/* DIVIDER                                           */}
        {/* ================================================= */}

        <Divider
          sx={{
            flexShrink: 0,

            borderColor: "rgba(255,255,255,0.12)",
          }}
        />

        {/* ================================================= */}
        {/* NAVIGATION                                        */}
        {/* ================================================= */}

        <Box
          sx={{
            flex: 1,

            minHeight: 0,

            overflowY: "auto",

            overflowX: "hidden",

            py: 2,

            "&::-webkit-scrollbar": {
              width: 5,
            },

            "&::-webkit-scrollbar-track": {
              background: "rgba(255,255,255,0.04)",
            },

            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255,255,255,0.20)",

              borderRadius: 10,
            },
          }}
        >
          <List
            disablePadding
            sx={{
              px: 1.5,
            }}
          >
            {navigationItems.map((item) => {
              const active = isActive(item.path);

              return (
                <ListItemButton
                  key={item.path}
                  selected={active}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    minHeight: 48,

                    mb: 0.5,

                    px: 1.5,

                    borderRadius: 2,

                    color: "primary.contrastText",

                    transition: "background-color 0.2s ease",

                    "& .MuiListItemIcon-root": {
                      minWidth: 38,
                      color: "inherit",
                    },

                    "&.Mui-selected": {
                      bgcolor: "rgba(0,0,0,0.18)",
                    },

                    "&.Mui-selected:hover": {
                      bgcolor: "rgba(0,0,0,0.24)",
                    },

                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.10)",
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,

                      fontWeight: active ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* ================================================= */}
        {/* LOGOUT                                            */}
        {/* ================================================= */}

        <Box
          sx={{
            flexShrink: 0,

            px: 1.5,
            py: 2,

            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <ListItemButton
            onClick={handleLogout}
            disabled={loggingOut}
            sx={{
              minHeight: 46,

              borderRadius: 2,

              justifyContent: "center",

              color: "primary.contrastText",

              opacity: loggingOut ? 0.7 : 1,

              "&:hover": {
                bgcolor: "rgba(255,255,255,0.10)",
              },

              "&.Mui-disabled": {
                color: "primary.contrastText",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 34,

                color: "inherit",
              }}
            >
              <LogoutRoundedIcon />
            </ListItemIcon>

            <ListItemText
              primary={loggingOut ? "Logging out..." : "Logout"}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 600,
              }}
            />
          </ListItemButton>
        </Box>
      </Paper>
    </>
  );
};

export default DashboardSidebar;
