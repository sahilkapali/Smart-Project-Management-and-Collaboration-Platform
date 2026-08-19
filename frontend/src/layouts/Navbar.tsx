import { useState, useEffect, useCallback, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Avatar,
  Stack,
  Tooltip,
  Popover,
  Button,
  Divider,
} from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import toast from "react-hot-toast";

import {
  getUnreadNotificationCount,
  getMyNotifications,
} from "../services/notification.service";
import { ROUTES } from "../utils/routes";
import { useSocket } from "../hooks/useSocket";
import type { AppNotification } from "../types/notification.types";

interface NavbarProps {
  onToggleSidebar?: () => void;
  user?: {
    id?: string;
    _id?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

const Navbar = ({ onToggleSidebar, user }: NavbarProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Initialize Socket Connection using the user ID
  const userId = user?.id || user?._id;
  const socket = useSocket(userId);

  // ==========================================================
  // FETCH NOTIFICATIONS & UNREAD COUNT
  // ==========================================================
  const fetchNotificationData = useCallback(async () => {
    try {
      const [count, list] = await Promise.all([
        getUnreadNotificationCount(),
        getMyNotifications().catch(() => []),
      ]);
      setUnreadCount(count);
      setNotifications(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to fetch notification data:", error);
    }
  }, []);

  useEffect(() => {
    void fetchNotificationData();

    // Fallback polling interval every 60 seconds
    const intervalId = setInterval(() => {
      void fetchNotificationData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchNotificationData]);

  // ==========================================================
  // REAL-TIME WEBSOCKET LISTENER
  // ==========================================================
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: AppNotification) => {
      setUnreadCount((prevCount) => prevCount + 1);
      setNotifications((prev) => [notification, ...prev]);

      if (notification?.message) {
        toast(notification.message, { icon: "🔔" });
      }
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket]);

  // ==========================================================
  // POPOVER & ACTION HANDLERS
  // ==========================================================
  const handleOpenDropdown = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null);
  };

  const handleViewAll = () => {
    handleCloseDropdown();
    navigate(ROUTES.NOTIFICATIONS || "/notifications");
  };

  const isDropdownOpen = Boolean(anchorEl);
  const avatarLetter = user?.firstName?.charAt(0).toUpperCase() || "U";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
        {/* LEFT SIDE: MENU & LOGO */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {onToggleSidebar && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onToggleSidebar}
              sx={{ display: { md: "none" } }}
            >
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            fontWeight={800}
            color="primary.main"
            sx={{ display: { xs: "none", sm: "block" }, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            MyApp
          </Typography>
        </Stack>

        {/* RIGHT SIDE: NOTIFICATION ICON & AVATAR */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleOpenDropdown}
              sx={{
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                  bgcolor: "action.hover",
                },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    fontWeight: 700,
                  },
                }}
              >
                <NotificationsRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <Avatar
              src={user?.avatar}
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              {avatarLetter}
            </Avatar>
          </Box>
        </Stack>

        {/* NOTIFICATION DROPDOWN POPOVER */}
        <Popover
          open={isDropdownOpen}
          anchorEl={anchorEl}
          onClose={handleCloseDropdown}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              width: 360,
              maxHeight: 480,
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              bgcolor: "background.paper",
              overflow: "hidden",
            },
          }}
        >
          {/* HEADER */}
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight={800}>
              Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </Typography>
          </Box>

          {/* LIST ITEMS (NON-CLICKABLE & NO REROUTING) */}
          <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications found
                </Typography>
              </Box>
            ) : (
              notifications.map((notification, index) => (
                <Box key={notification._id || index}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      cursor: "default", // Strictly non-clickable
                      userSelect: "none",
                      bgcolor: notification.isRead
                        ? "transparent"
                        : "action.hover",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "primary.main",
                          fontSize: "0.875rem",
                        }}
                      >
                        <TaskAltRoundedIcon fontSize="small" />
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {notification.type === "TASK_ASSIGNED" ||
                          !notification.type
                            ? "Task assigned"
                            : notification.type.replace(/_/g, " ")}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ lineHeight: 1.3, mt: 0.25 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          Just now
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </Box>

          {/* FOOTER */}
          <Box
            sx={{
              p: 1.5,
              px: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
            >
              <Button
                size="small"
                onClick={handleViewAll}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                }}
              >
                View all notifications
              </Button>
            </Stack>
          </Box>
        </Popover>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;