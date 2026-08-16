// src/pages/notification/NotificationsPage.tsx

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

// ============================================================
// NOTIFICATION TITLE
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

// ============================================================
// NOTIFICATION ICON
// ============================================================

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

// ============================================================
// DATE FORMATTER
// ============================================================

const formatNotificationDate = (date: string | Date): string => {
  const notificationDate = new Date(date);

  if (Number.isNaN(notificationDate.getTime())) {
    return "";
  }

  const now = new Date();

  const diff = now.getTime() - notificationDate.getTime();

  // Future date
  if (diff < 0) {
    return notificationDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return notificationDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ============================================================
// SENDER NAME
// ============================================================

const getSenderName = (notification: AppNotification): string => {
  const sender = notification.sender;

  if (!sender) {
    return "System";
  }

  if (sender.firstName || sender.lastName) {
    return [sender.firstName, sender.lastName].filter(Boolean).join(" ");
  }

  if (sender.name) {
    return sender.name;
  }

  if (sender.email) {
    return sender.email;
  }

  return "System";
};

// ============================================================
// AVATAR LETTER
// ============================================================

const getAvatarLetter = (notification: AppNotification): string => {
  const senderName = getSenderName(notification);

  return senderName.charAt(0).toUpperCase() || "S";
};

// ============================================================
// PAGE
// ============================================================

const NotificationsPage = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const [markingAll, setMarkingAll] = useState(false);

  // ==========================================================
  // LOAD REAL NOTIFICATIONS
  // ==========================================================

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getMyNotifications();

      // IMPORTANT:
      // Only backend data is used.
      // No dummy/fallback notifications.

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);

      setNotifications([]);

      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  // ==========================================================
  // UNREAD COUNT
  // ==========================================================

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  // ==========================================================
  // MARK ONE AS READ
  // ==========================================================

  const handleMarkAsRead = async (notification: AppNotification) => {
    if (notification.isRead) {
      return;
    }

    try {
      setProcessingId(notification._id);

      const updated = await markNotificationAsRead(notification._id);

      setNotifications((current) =>
        current.map((item) =>
          item._id === updated._id
            ? {
                ...item,
                isRead: updated.isRead,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);

      toast.error("Could not mark notification as read.");
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setMarkingAll(true);

      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);

      toast.error("Could not mark all notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  // ==========================================================
  // NOTIFICATION CLICK
  // ==========================================================

  const handleNotificationClick = async (notification: AppNotification) => {
    await handleMarkAsRead(notification);

    /*
     * We intentionally DO NOT use:
     *
     * notification.title
     * notification.link
     *
     * because your backend does not provide
     * those properties.
     *
     * Your backend provides:
     *
     * relatedEntityId
     * relatedEntityType
     *
     * Those can be connected to real routes later.
     */
  };

  // ==========================================================
  // LOADING
  // ==========================================================

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

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1100,
        mx: "auto",
        px: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        py: 4,
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
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
                    minWidth: 28,
                    height: 28,
                    px: 1,
                    borderRadius: 99,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {unreadCount}
                </Box>
              )}
            </Stack>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Stay updated with your project activity.
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
        >
          Mark all as read
        </Button>
      </Stack>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {notifications.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: {
              xs: 4,
              sm: 6,
            },
            textAlign: "center",
          }}
        >
          <NotificationsNoneRoundedIcon
            sx={{
              fontSize: 58,
              color: "text.disabled",
              mb: 1,
            }}
          />

          <Typography variant="h6" fontWeight={700}>
            No notifications
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            You're all caught up.
          </Typography>
        </Paper>
      ) : (
        /* ===================================================
           REAL BACKEND NOTIFICATIONS
        =================================================== */

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {notifications.map((notification, index) => {
            const senderName = getSenderName(notification);

            const avatarLetter = getAvatarLetter(notification);

            const title = getNotificationTitle(notification.type);

            const icon = getNotificationIcon(notification.type);

            const isProcessing = processingId === notification._id;

            return (
              <Box key={notification._id}>
                <Box
                  onClick={() => void handleNotificationClick(notification)}
                  sx={{
                    px: {
                      xs: 2,
                      sm: 3,
                    },
                    py: 2,
                    cursor: "pointer",
                    bgcolor: notification.isRead
                      ? "background.paper"
                      : "action.hover",
                    transition: "background-color 0.2s ease",

                    "&:hover": {
                      bgcolor: "action.selected",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    {/* AVATAR */}

                    <Avatar
                      sx={{
                        width: 46,
                        height: 46,
                        bgcolor: notification.isRead
                          ? "action.disabledBackground"
                          : "primary.main",
                        color: notification.isRead
                          ? "text.secondary"
                          : "primary.contrastText",
                        fontWeight: 700,
                      }}
                    >
                      {avatarLetter}
                    </Avatar>

                    {/* CONTENT */}

                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Stack
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
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
                        sx={{
                          mt: 0.5,
                          lineHeight: 1.6,
                        }}
                      >
                        {notification.message}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{
                          display: "block",
                          mt: 0.75,
                        }}
                      >
                        From {senderName}
                      </Typography>

                      {notification.relatedEntityType && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{
                            display: "block",
                            mt: 0.25,
                          }}
                        >
                          {notification.relatedEntityType}
                        </Typography>
                      )}
                    </Box>

                    {/* MARK AS READ */}

                    {!notification.isRead && (
                      <Tooltip title="Mark as read">
                        <span>
                          <IconButton
                            size="small"
                            disabled={isProcessing}
                            onClick={(event) => {
                              event.stopPropagation();

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

                {index < notifications.length - 1 && <Divider />}
              </Box>
            );
          })}
        </Paper>
      )}
    </Box>
  );
};

export default NotificationsPage;
