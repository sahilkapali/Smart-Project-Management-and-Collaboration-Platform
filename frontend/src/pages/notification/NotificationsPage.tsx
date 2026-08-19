import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";

import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notification.service";

import type {
  AppNotification,
  NotificationType,
} from "../../types/notification.types";

import { ROUTES } from "../../utils/routes";
import { useSocket } from "../../hooks/useSocket";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getNotificationTitle = (type: NotificationType): string => {
  switch (type) {
    case "TASK_ASSIGNED":
      return "Task Assigned";
    case "TASK_UPDATED":
      return "Task Updated";
    case "COMMENT_ADDED":
      return "New Comment";
    case "DEADLINE_APPROACHING":
      return "Deadline Approaching";
    case "MEMBER_ADDED":
      return "New Member";
    case "MEETING_INVITATION":
      return "Meeting Invitation";
    case "SYSTEM_ALERT":
      return "System Alert";
    default:
      return "Notification";
  }
};

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "TASK_ASSIGNED":
      return <TaskAltRoundedIcon />;
    case "TASK_UPDATED":
      return <UpdateRoundedIcon />;
    case "COMMENT_ADDED":
      return <CommentRoundedIcon />;
    case "DEADLINE_APPROACHING":
      return <WarningAmberRoundedIcon />;
    case "MEMBER_ADDED":
      return <GroupAddRoundedIcon />;
    case "MEETING_INVITATION":
      return <EventRoundedIcon />;
    case "SYSTEM_ALERT":
      return <InfoOutlinedIcon />;
    default:
      return <NotificationsNoneRoundedIcon />;
  }
};

const formatNotificationDate = (date: string | Date): string => {
  const notificationDate = new Date(date);
  if (Number.isNaN(notificationDate.getTime())) return "";

  const now = new Date();
  const diff = now.getTime() - notificationDate.getTime();

  if (diff < 0) {
    return notificationDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return notificationDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getSenderName = (notification: AppNotification): string => {
  const sender = notification.sender;
  if (!sender) return "System";
  if (sender.firstName || sender.lastName) {
    return [sender.firstName, sender.lastName].filter(Boolean).join(" ");
  }
  if (sender.name) return sender.name;
  if (sender.email) return sender.email;
  return "System";
};

const getAvatarLetter = (notification: AppNotification): string => {
  const senderName = getSenderName(notification);
  return senderName.charAt(0).toUpperCase() || "S";
};

// ============================================================
// COMPONENT
// ============================================================

const NotificationsPage = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");

  // ==========================================================
  // FETCH NOTIFICATIONS
  // ==========================================================
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  // ==========================================================
  // SOCKET REAL-TIME LISTENERS
  // ==========================================================
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotification: AppNotification) => {
      setNotifications((current) => {
        const exists = current.some((item) => item._id === newNotification._id);
        if (exists) return current;
        return [newNotification, ...current];
      });

      if (newNotification?.message) {
        toast(newNotification.message, { icon: "🔔" });
      }
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  // ==========================================================
  // DERIVED STATE & FILTERING
  // ==========================================================
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const displayedNotifications = useMemo(() => {
    if (activeTab === "UNREAD") {
      return notifications.filter((item) => !item.isRead);
    }
    return notifications;
  }, [notifications, activeTab]);

  // ==========================================================
  // ACTIONS
  // ==========================================================
  const handleMarkAsRead = async (notification: AppNotification) => {
    if (notification.isRead) return;

    // Optimistic UI Update
    setNotifications((current) =>
      current.map((item) =>
        item._id === notification._id ? { ...item, isRead: true } : item,
      ),
    );

    try {
      setProcessingId(notification._id);
      await markNotificationAsRead(notification._id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);

      // Revert Optimistic Update
      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id ? { ...item, isRead: false } : item,
        ),
      );
      toast.error("Could not mark notification as read.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic UI Update
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    );

    try {
      setMarkingAll(true);
      await markAllNotificationsAsRead();
      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      void loadNotifications(); // Reload state on failure
      toast.error("Could not mark all notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const openRelatedEntity = (notification: AppNotification) => {
    const entityId = notification.relatedEntityId;
    const entityType = notification.relatedEntityType?.toUpperCase();

    if (!entityId) return;

    if (
      entityType === "TASK" ||
      notification.type === "TASK_ASSIGNED" ||
      notification.type === "TASK_UPDATED"
    ) {
      navigate(ROUTES.TASKS || "/tasks");
      return;
    }

    if (entityType === "PROJECT") {
      navigate(`/projects/${entityId}`);
      return;
    }

    if (
      entityType === "MEETING" ||
      notification.type === "MEETING_INVITATION"
    ) {
      navigate(`/meetings/${entityId}`);
      return;
    }

    if (entityType === "TEAM") {
      navigate(ROUTES.TEAMS || "/teams");
      return;
    }
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      void handleMarkAsRead(notification);
    }
    openRelatedEntity(notification);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
      }}
    >
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowBackRoundedIcon />
          </IconButton>

          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4" fontWeight={800}>
                Notifications
              </Typography>

              {unreadCount > 0 && (
                <Box
                  sx={{
                    minWidth: 26,
                    height: 26,
                    px: 1,
                    borderRadius: 99,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "error.main",
                    color: "error.contrastText",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {unreadCount}
                </Box>
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Stay updated with your latest workspace activity.
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          startIcon={
            markingAll ? <CircularProgress size={16} /> : <DoneAllRoundedIcon />
          }
          onClick={handleMarkAllAsRead}
          disabled={markingAll || unreadCount === 0}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Mark all as read
        </Button>
      </Stack>

      {/* FILTER TABS */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          aria-label="Notification filters"
        >
          <Tab
            label="All"
            value="ALL"
            sx={{ textTransform: "none", fontWeight: 700 }}
          />
          <Tab
            label={`Unread (${unreadCount})`}
            value="UNREAD"
            sx={{ textTransform: "none", fontWeight: 700 }}
          />
        </Tabs>
      </Box>

      {/* EMPTY STATE */}
      {displayedNotifications.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: { xs: 4, sm: 6 },
            textAlign: "center",
          }}
        >
          <NotificationsNoneRoundedIcon
            sx={{ fontSize: 56, color: "text.disabled", mb: 1 }}
          />
          <Typography variant="h6" fontWeight={700}>
            No notifications found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {activeTab === "UNREAD"
              ? "You have read all your notifications."
              : "You're all caught up!"}
          </Typography>
        </Paper>
      ) : (
        /* NOTIFICATION LIST */
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {displayedNotifications.map((notification, index) => {
            const senderName = getSenderName(notification);
            const avatarLetter = getAvatarLetter(notification);
            const title = getNotificationTitle(notification.type);
            const icon = getNotificationIcon(notification.type);
            const isProcessing = processingId === notification._id;

            return (
              <Box key={notification._id}>
                <Box
                  onClick={() => void handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      void handleNotificationClick(notification);
                    }
                  }}
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    cursor: "pointer",
                    bgcolor: notification.isRead
                      ? "background.paper"
                      : "action.hover",
                    transition: "background-color 0.2s ease",
                    "&:hover": { bgcolor: "action.selected" },
                    "&:focus-visible": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: "-2px",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: notification.isRead
                          ? "action.disabledBackground"
                          : "primary.main",
                        color: notification.isRead
                          ? "text.secondary"
                          : "primary.contrastText",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {avatarLetter}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        spacing={0.5}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              color: notification.isRead
                                ? "text.secondary"
                                : "primary.main",
                            }}
                          >
                            {icon}
                          </Box>

                          <Typography
                            fontWeight={notification.isRead ? 600 : 800}
                            variant="body1"
                          >
                            {title}
                          </Typography>

                          {!notification.isRead && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                              }}
                            />
                          )}
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                          {formatNotificationDate(notification.createdAt)}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, lineHeight: 1.5 }}
                      >
                        {notification.message}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ mt: 0.75 }}
                      >
                        <Typography variant="caption" color="text.disabled">
                          From {senderName}
                        </Typography>

                        {notification.relatedEntityType && (
                          <>
                            <Typography variant="caption" color="text.disabled">
                              •
                            </Typography>
                            <Typography variant="caption" color="primary.main">
                              {notification.relatedEntityType}
                            </Typography>
                          </>
                        )}
                      </Stack>
                    </Box>

                    {!notification.isRead && (
                      <Tooltip title="Mark as read">
                        <span>
                          <IconButton
                            size="small"
                            disabled={isProcessing}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleMarkAsRead(notification);
                            }}
                          >
                            {isProcessing ? (
                              <CircularProgress size={18} />
                            ) : (
                              <CheckRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>

                {index < displayedNotifications.length - 1 && <Divider />}
              </Box>
            );
          })}
        </Paper>
      )}
    </Box>
  );
};

export default NotificationsPage;
