import { useEffect, useMemo, useState } from "react";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import NotificationsOffRoundedIcon from "@mui/icons-material/NotificationsOffRounded";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notification.service";

import type {
  AppNotification,
  NotificationType,
} from "../../types/notification.types";

interface DashboardNavbarProps {
  onMenuClick?: () => void;
  userName?: string;
  userAvatar?: string;
}

const DashboardNavbar = ({
  onMenuClick,
  userName = "User",
  userAvatar,
}: DashboardNavbarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { logout } = useAuth();

  // =========================================================
  // STATE MANAGEMENT
  // =========================================================

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null,
  );

  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);

  const [loggingOut, setLoggingOut] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [notificationError, setNotificationError] = useState<string | null>(
    null,
  );

  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  const [markingNotificationId, setMarkingNotificationId] = useState<
    string | null
  >(null);

  const profileMenuOpen = Boolean(profileAnchorEl);

  const notificationMenuOpen = Boolean(notificationAnchorEl);

  // =========================================================
  // LOAD NOTIFICATIONS FROM BACKEND
  // =========================================================

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      setNotificationError(null);

      const notificationData = await getMyNotifications();

      setNotifications(Array.isArray(notificationData) ? notificationData : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);

      setNotificationError("Unable to load notifications.");

      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // =========================================================
  // INITIAL NOTIFICATION LOAD
  // =========================================================

  useEffect(() => {
    void loadNotifications();
  }, []);

  // =========================================================
  // UNREAD NOTIFICATION COUNT
  // =========================================================

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  // =========================================================
  // PROFILE MENU HANDLERS
  // =========================================================

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);

    setNotificationAnchorEl(null);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  // =========================================================
  // NOTIFICATION MENU HANDLERS
  // =========================================================

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    if (notificationMenuOpen) {
      setNotificationAnchorEl(null);
    } else {
      setNotificationAnchorEl(event.currentTarget);

      void loadNotifications();
    }

    setProfileAnchorEl(null);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  // =========================================================
  // MARK SINGLE NOTIFICATION AS READ
  // =========================================================

  const handleMarkAsRead = async (notificationId: string) => {
    if (markingNotificationId === notificationId) {
      return;
    }

    try {
      setMarkingNotificationId(notificationId);

      const updatedNotification = await markNotificationAsRead(notificationId);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                ...updatedNotification,
                isRead: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);

      toast.error("Failed to mark notification as read.");
    } finally {
      setMarkingNotificationId(null);
    }
  };

  // =========================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =========================================================

  const handleMarkAllAsRead = async () => {
    if (markingAllAsRead || unreadCount === 0) {
      return;
    }

    try {
      setMarkingAllAsRead(true);

      await markAllNotificationsAsRead();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);

      toast.error("Failed to mark all notifications as read.");
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  // =========================================================
  // NOTIFICATION ITEM CLICK
  // =========================================================

  const handleNotificationItemClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
  };

  // =========================================================
  // VIEW ALL NOTIFICATIONS
  // =========================================================

  const handleViewAllNotifications = () => {
    handleNotificationMenuClose();

    navigate("/notifications");
  };

  // =========================================================
  // PROFILE NAVIGATION
  // =========================================================

  const handleNavigation = (path: string) => {
    handleProfileMenuClose();

    navigate(path);
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

      handleProfileMenuClose();

      await logout();

      toast.success("Logged out successfully.");

      navigate("/login", {
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
  // USER INITIALS
  // =========================================================

  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();

  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "TASK_ASSIGNED":
      case "TASK_UPDATED":
        return <AssignmentRoundedIcon fontSize="small" />;

      case "MEMBER_ADDED":
        return <GroupsRoundedIcon fontSize="small" />;

      case "DEADLINE_APPROACHING":
        return <WarningAmberRoundedIcon fontSize="small" />;

      case "MEETING_INVITATION":
        return <EventRoundedIcon fontSize="small" />;

      case "COMMENT_ADDED":
        return <NotificationsActiveRoundedIcon fontSize="small" />;

      case "SYSTEM_ALERT":
        return <WarningAmberRoundedIcon fontSize="small" />;

      default:
        return <NotificationsNoneRoundedIcon fontSize="small" />;
    }
  };

  // =========================================================
  // NOTIFICATION ICON STYLES
  // =========================================================

  const getNotificationIconStyles = (type: NotificationType) => {
    switch (type) {
      case "TASK_ASSIGNED":
      case "TASK_UPDATED":
        return {
          bgcolor: theme.palette.primary.light,
          color: theme.palette.primary.main,
        };

      case "MEMBER_ADDED":
        return {
          bgcolor: theme.palette.success.light,
          color: theme.palette.success.main,
        };

      case "DEADLINE_APPROACHING":
        return {
          bgcolor: theme.palette.warning.light,
          color: theme.palette.warning.main,
        };

      case "MEETING_INVITATION":
        return {
          bgcolor: theme.palette.info.light,
          color: theme.palette.info.main,
        };

      case "COMMENT_ADDED":
        return {
          bgcolor: theme.palette.secondary.light,
          color: theme.palette.secondary.main,
        };

      case "SYSTEM_ALERT":
        return {
          bgcolor: theme.palette.error.light,
          color: theme.palette.error.main,
        };

      default:
        return {
          bgcolor: theme.palette.action.hover,
          color: theme.palette.text.secondary,
        };
    }
  };

  // =========================================================
  // FORMAT NOTIFICATION TIME
  // =========================================================

  const formatNotificationTime = (createdAt: string): string => {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const differenceInSeconds = Math.floor(
      (now.getTime() - date.getTime()) / 1000,
    );

    if (differenceInSeconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(differenceInSeconds / 60);

    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return date.toLocaleDateString();
  };

  // =========================================================
  // NOTIFICATION TITLE
  // =========================================================

  const getNotificationTitle = (type: NotificationType): string => {
    switch (type) {
      case "TASK_ASSIGNED":
        return "Task assigned";

      case "TASK_UPDATED":
        return "Task updated";

      case "COMMENT_ADDED":
        return "New comment";

      case "DEADLINE_APPROACHING":
        return "Deadline approaching";

      case "MEMBER_ADDED":
        return "Team member added";

      case "MEETING_INVITATION":
        return "Meeting invitation";

      case "SYSTEM_ALERT":
        return "System alert";

      default:
        return "Notification";
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: {
          xs: 0,
          md: 250,
        },

        width: {
          xs: "100%",
          md: "calc(100% - 250px)",
        },

        bgcolor: "background.paper",

        color: "text.primary",

        borderBottom: "1px solid",

        borderColor: "divider",

        zIndex: theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          minHeight: {
            xs: 64,
            md: 72,
          },

          px: {
            xs: 1.5,
            sm: 2,
            md: 3,
          },

          gap: 2,
        }}
      >
        {/* ==================================================
            MOBILE MENU BUTTON
        ================================================== */}

        <IconButton
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          sx={{
            display: {
              xs: "inline-flex",
              md: "none",
            },
          }}
        >
          <MenuRoundedIcon />
        </IconButton>

        {/* ==================================================
            SPACER
        ================================================== */}

        <Box sx={{ flex: 1 }} />

        {/* ==================================================
            NOTIFICATION BUTTON
        ================================================== */}

        <Tooltip title="Notifications">
          <IconButton
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={notificationMenuOpen ? "true" : undefined}
            onClick={handleNotificationClick}
            sx={{
              width: 42,
              height: 42,

              color: "text.primary",

              borderRadius: 2,

              transition: "all 0.2s ease",

              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="primary"
              max={99}
              invisible={unreadCount === 0}
              sx={{
                "& .MuiBadge-badge": {
                  minWidth: 18,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  border: "2px solid",
                  borderColor: "background.paper",
                },
              }}
            >
              {unreadCount > 0 ? (
                <NotificationsActiveRoundedIcon />
              ) : (
                <NotificationsNoneRoundedIcon />
              )}
            </Badge>
          </IconButton>
        </Tooltip>

        {/* ==================================================
            NOTIFICATION MENU
        ================================================== */}

        <Menu
          anchorEl={notificationAnchorEl}
          open={notificationMenuOpen}
          onClose={handleNotificationMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          MenuListProps={{
            disablePadding: true,
          }}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1.5,

              width: {
                xs: "calc(100vw - 24px)",
                sm: 390,
              },

              maxWidth: 390,

              borderRadius: 3,

              overflow: "hidden",

              border: "1px solid",

              borderColor: "divider",

              boxShadow: "0px 12px 40px rgba(0, 0, 0, 0.12)",
            },
          }}
        >
          {/* Notification Header */}

          <Box
            sx={{
              px: 2,
              py: 1.75,

              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",

              bgcolor: "background.paper",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Notifications
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {loadingNotifications
                  ? "Loading notifications..."
                  : unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount === 1 ? "" : "s"
                      }`
                    : "You're all caught up"}
              </Typography>
            </Box>

            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={
                  markingAllAsRead ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <DoneAllRoundedIcon />
                  )
                }
                onClick={() => {
                  void handleMarkAllAsRead();
                }}
                disabled={markingAllAsRead}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  minWidth: "auto",
                  px: 1,
                }}
              >
                {markingAllAsRead ? "Reading..." : "Mark all read"}
              </Button>
            )}
          </Box>

          <Divider />

          {/* ==================================================
              NOTIFICATION CONTENT
          ================================================== */}

          {loadingNotifications ? (
            <Box
              sx={{
                py: 5,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : notificationError ? (
            <Box
              sx={{
                py: 5,
                px: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" fontWeight={700}>
                Unable to load notifications
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 0.5,
                }}
              >
                Please check your connection and try again.
              </Typography>

              <Button
                size="small"
                onClick={() => {
                  void loadNotifications();
                }}
                sx={{
                  mt: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Try again
              </Button>
            </Box>
          ) : notifications.length > 0 ? (
            <Box
              sx={{
                maxHeight: 390,
                overflowY: "auto",

                "&::-webkit-scrollbar": {
                  width: 5,
                },

                "&::-webkit-scrollbar-thumb": {
                  borderRadius: 10,
                  bgcolor: "divider",
                },
              }}
            >
              {notifications.map((notification, index) => {
                const iconStyles = getNotificationIconStyles(notification.type);

                const isBeingMarked =
                  markingNotificationId === notification._id;

                return (
                  <Box key={notification._id}>
                    <MenuItem
                      onClick={() => {
                        void handleNotificationItemClick(notification);
                      }}
                      disabled={isBeingMarked}
                      sx={{
                        px: 2,
                        py: 1.5,
                        gap: 1.5,
                        alignItems: "flex-start",
                        whiteSpace: "normal",

                        bgcolor: notification.isRead
                          ? "background.paper"
                          : `${theme.palette.primary.main}08`,

                        transition: "background-color 0.2s ease",

                        "&:hover": {
                          bgcolor: notification.isRead
                            ? "action.hover"
                            : `${theme.palette.primary.main}12`,
                        },
                      }}
                    >
                      {/* Notification Icon */}

                      <Box
                        sx={{
                          width: 40,
                          height: 40,

                          borderRadius: "50%",

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          flexShrink: 0,

                          ...iconStyles,
                        }}
                      >
                        {isBeingMarked ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          getNotificationIcon(notification.type)
                        )}
                      </Box>

                      {/* Notification Text */}

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",

                            alignItems: "flex-start",

                            justifyContent: "space-between",

                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={notification.isRead ? 600 : 800}
                            sx={{
                              lineHeight: 1.35,
                            }}
                          >
                            {getNotificationTitle(notification.type)}
                          </Typography>

                          {!notification.isRead && (
                            <Box
                              sx={{
                                width: 7,
                                height: 7,

                                borderRadius: "50%",

                                bgcolor: "primary.main",

                                flexShrink: 0,

                                mt: 0.7,
                              }}
                            />
                          )}
                        </Box>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            lineHeight: 1.5,
                            mt: 0.35,
                          }}
                        >
                          {notification.message}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontSize: 11,
                            mt: 0.6,
                          }}
                        >
                          {formatNotificationTime(notification.createdAt)}
                        </Typography>
                      </Box>
                    </MenuItem>

                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box
              sx={{
                py: 5,
                px: 2,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 54,
                  height: 54,

                  borderRadius: "50%",

                  mx: "auto",

                  mb: 1.5,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  bgcolor: "action.hover",

                  color: "text.secondary",
                }}
              >
                <NotificationsOffRoundedIcon />
              </Box>

              <Typography variant="body2" fontWeight={700}>
                No notifications
              </Typography>

              <Typography variant="caption" color="text.secondary">
                You're all caught up!
              </Typography>
            </Box>
          )}

          <Divider />

          {/* ==================================================
              NOTIFICATION FOOTER
          ================================================== */}

          {notifications.length > 0 && (
            <Box
              sx={{
                px: 1,
                py: 0.75,

                display: "flex",

                alignItems: "center",

                justifyContent: "flex-end",
              }}
            >
              <Button
                size="small"
                onClick={handleViewAllNotifications}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                View all notifications
              </Button>
            </Box>
          )}
        </Menu>

        {/* ==================================================
            USER PROFILE
        ================================================== */}

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            cursor: "pointer",

            ml: {
              xs: 0,
              sm: 0.5,
            },

            borderRadius: 2,

            px: 0.5,

            py: 0.5,

            transition: "background-color 0.2s ease",

            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
          onClick={handleProfileClick}
        >
          <Avatar
            src={userAvatar}
            alt={userName}
            sx={{
              width: 38,
              height: 38,

              bgcolor: "primary.main",

              fontSize: 14,

              fontWeight: 700,
            }}
          >
            {!userAvatar && initials}
          </Avatar>

          <Box
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
              {userName}
            </Typography>
          </Box>

          <KeyboardArrowDownRoundedIcon
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },

              color: "text.secondary",
            }}
          />
        </Stack>

        {/* ==================================================
            PROFILE MENU
        ================================================== */}

        <Menu
          anchorEl={profileAnchorEl}
          open={profileMenuOpen}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            elevation: 4,

            sx: {
              mt: 1,

              minWidth: 190,

              borderRadius: 2,
            },
          }}
        >
          <MenuItem onClick={() => handleNavigation("/profile")}>
            Profile
          </MenuItem>

          <MenuItem onClick={() => handleNavigation("/settings")}>
            Settings
          </MenuItem>

          <Divider />

          <MenuItem onClick={() => void handleLogout()} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Logout"}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardNavbar;
