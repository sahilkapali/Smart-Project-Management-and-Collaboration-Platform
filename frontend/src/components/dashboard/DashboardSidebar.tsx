import { useState, type ReactNode } from "react";

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
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

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
  adminOnly?: boolean;
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
    label: "Repositories",
    path: "/repository",
    icon: <CodeRoundedIcon />,
  },
  {
    label: "Issues",
    path: "/issues",
    icon: <BugReportRoundedIcon />,
  },
  {
    label: "Teams",
    path: "/teams",
    icon: <GroupsRoundedIcon />,
  },
  {
    label: "Meetings",
    path: "/meetings",
    icon: <EventRoundedIcon />,
  },
  {
    label: "Activity Feed",
    path: "/activity",
    icon: <HistoryRoundedIcon />,
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
    label: "User Management",
    path: "/admin/users",
    icon: <ManageAccountsRoundedIcon />,
    adminOnly: true,
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

  const { user, logout } = useAuth();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loggingOut, setLoggingOut] = useState(false);

  const isDarkMode = theme.palette.mode === "dark";

  const sidebarTextColor = isDarkMode
    ? theme.palette.common.white
    : theme.palette.text.primary;

  const sidebarSecondaryTextColor = isDarkMode
    ? "rgba(255,255,255,0.70)"
    : theme.palette.text.secondary;

  const sidebarHoverBackground = isDarkMode
    ? "rgba(255,255,255,0.08)"
    : "rgba(37,99,235,0.08)";

  const sidebarActiveBackground = isDarkMode
    ? "rgba(37,99,235,0.28)"
    : "rgba(37,99,235,0.12)";

  const sidebarActiveHoverBackground = isDarkMode
    ? "rgba(37,99,235,0.36)"
    : "rgba(37,99,235,0.18)";

  const sidebarBorderColor = isDarkMode
    ? "rgba(255,255,255,0.10)"
    : theme.palette.divider;

  const logoBackground = isDarkMode
    ? "rgba(255,255,255,0.10)"
    : "rgba(37,99,235,0.10)";

  const logoBorder = isDarkMode
    ? "rgba(255,255,255,0.18)"
    : "rgba(37,99,235,0.20)";

  /*
   * Keep this flexible because different backends may return
   * role values using different casing.
   */
  const userRole = String(user?.role ?? "").toUpperCase();

  const isAdmin =
    userRole === "ADMIN" ||
    userRole === "SUPER_ADMIN" ||
    userRole === "SUPERADMIN";

  const handleNavigation = (path: string) => {
    navigate(path);

    if (isMobile) {
      onClose?.();
    }
  };

  const isActive = (path: string) => {
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === ROUTES.DASHBOARD;
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

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

  if (isMobile && !open) {
    return null;
  }

  const visibleNavigationItems = navigationItems.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <>
      {isMobile && open && (
        <Box
          onClick={onClose}
          aria-hidden="true"
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.35)",
            zIndex: theme.zIndex.drawer - 1,
          }}
        />
      )}

      <Paper
        elevation={0}
        square
        component="aside"
        aria-label="Main navigation"
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

          bgcolor: "background.paper",
          color: sidebarTextColor,

          borderRight: "1px solid",
          borderColor: sidebarBorderColor,

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
        {/* BRAND */}

        <Box
          sx={{
            flexShrink: 0,
            px: 2.5,
            pt: 3,
            pb: 2.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 42,
                height: 42,
                flexShrink: 0,
                borderRadius: 2,
                bgcolor: logoBackground,
                border: "1px solid",
                borderColor: logoBorder,

                color: isDarkMode
                  ? theme.palette.common.white
                  : theme.palette.primary.main,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                fontWeight: 800,
                fontSize: 18,
              }}
            >
              S
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                fontWeight={800}
                lineHeight={1.15}
                noWrap
                sx={{
                  fontSize: 16,
                  color: sidebarTextColor,
                }}
              >
                Smart Project
              </Typography>

              <Typography
                fontWeight={500}
                lineHeight={1.15}
                noWrap
                sx={{
                  fontSize: 14,
                  color: sidebarSecondaryTextColor,
                }}
              >
                Management
              </Typography>
            </Box>

            {isMobile && (
              <ButtonBase
                onClick={onClose}
                aria-label="Close navigation"
                sx={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: 2,
                  color: sidebarTextColor,

                  "&:hover": {
                    bgcolor: sidebarHoverBackground,
                  },
                }}
              >
                <CloseRoundedIcon />
              </ButtonBase>
            )}
          </Stack>
        </Box>

        <Divider
          sx={{
            flexShrink: 0,
            borderColor: sidebarBorderColor,
          }}
        />

        {/* NAVIGATION */}

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
              background: "transparent",
            },

            "&::-webkit-scrollbar-thumb": {
              background: isDarkMode
                ? "rgba(255,255,255,0.20)"
                : "rgba(0,0,0,0.15)",
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
            {visibleNavigationItems.map((item) => {
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

                    color: active
                      ? theme.palette.primary.main
                      : sidebarTextColor,

                    transition: "background-color 0.2s ease, color 0.2s ease",

                    "& .MuiListItemIcon-root": {
                      minWidth: 38,
                      color: "inherit",
                    },

                    "& .MuiListItemText-primary": {
                      color: "inherit",
                    },

                    "&.Mui-selected": {
                      bgcolor: sidebarActiveBackground,
                    },

                    "&.Mui-selected:hover": {
                      bgcolor: sidebarActiveHoverBackground,
                    },

                    "&:hover": {
                      bgcolor: sidebarHoverBackground,
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: active ? 700 : 500,
                      color: "inherit",
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* LOGOUT */}

        <Box
          sx={{
            flexShrink: 0,
            px: 1.5,
            py: 2,
            borderTop: "1px solid",
            borderColor: sidebarBorderColor,
          }}
        >
          <ListItemButton
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            sx={{
              minHeight: 46,
              borderRadius: 2,
              justifyContent: "center",
              color: sidebarTextColor,
              opacity: loggingOut ? 0.7 : 1,

              "&:hover": {
                bgcolor: sidebarHoverBackground,
              },

              "&.Mui-disabled": {
                color: sidebarTextColor,
              },

              "& .MuiListItemIcon-root": {
                minWidth: 34,
                color: "inherit",
              },

              "& .MuiListItemText-primary": {
                color: "inherit",
              },
            }}
          >
            <ListItemIcon>
              <LogoutRoundedIcon />
            </ListItemIcon>

            <ListItemText
              primary={loggingOut ? "Logging out..." : "Logout"}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 600,
                color: "inherit",
              }}
            />
          </ListItemButton>
        </Box>
      </Paper>
    </>
  );
};

export default DashboardSidebar;
