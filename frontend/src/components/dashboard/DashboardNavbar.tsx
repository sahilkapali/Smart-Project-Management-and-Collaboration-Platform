import { useEffect, useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CircleIcon from "@mui/icons-material/Circle";

import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  getUnreadNotificationsCount,
  markAllAsRead,
  markAsRead,
} from "../../services/notification.service";
import type { Notification } from "../../types/notification.types";

interface DashboardNavbarProps {
  onMenuClick?: () => void;
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
}

const DashboardNavbar = ({
  onMenuClick,
  userName = "User",
  userAvatar,
  notificationCount,
}: DashboardNavbarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Profile Menu Anchor State
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  // Notification Dropdown State
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState<number>(notificationCount ?? 0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const profileMenuOpen = Boolean(profileAnchorEl);
  const notifMenuOpen = Boolean(notifAnchorEl);

  // Fetch Unread Count
  const fetchCount = async () => {
    try {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  };

  useEffect(() => {
    if (notificationCount !== undefined) {
      setUnreadCount(notificationCount);
    } else {
      fetchCount();
    }
  }, [notificationCount]);

  // Open Notification Dropdown & Fetch Notifications
  const handleNotifClick = async (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
    try {
      setLoadingNotifs(true);
      const res = await getMyNotifications();
      setNotifications((res.data || []).slice(0, 5)); // Display latest 5
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  // Mark single item as read and handle redirection
  const handleItemClick = async (item: Notification) => {
    if (!item.isRead) {
      try {
        await markAsRead(item._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    if (item.link) {
      handleNotifClose();
      navigate(item.link);
    }
  };

  // Mark all items as read
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: { xs: 0, md: 250 },
        width: { xs: "100%", md: "calc(100% - 250px)" },
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 72 },
          px: { xs: 1.5, sm: 2, md: 3 },
          gap: 2,
        }}
      >
        {/* Mobile menu trigger */}
        <IconButton
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          sx={{ display: { xs: "inline-flex", md: "none" } }}
        >
          <MenuRoundedIcon />
        </IconButton>

        {/* Search Input */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 360,
            display: { xs: "none", sm: "block" },
          }}
        >
          <Box
            sx={{
              height: 42,
              display: "flex",
              alignItems: "center",
              px: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2.5,
              bgcolor: "background.default",
            }}
          >
            <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 21, mr: 1 }} />
            <InputBase
              placeholder="Search projects..."
              fullWidth
              sx={{
                fontSize: 14,
                "& input::placeholder": {
                  opacity: 1,
                  color: theme.palette.text.secondary,
                },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Notifications Icon Button */}
        <IconButton
          aria-label="Notifications"
          onClick={handleNotifClick}
          sx={{ color: "text.primary" }}
        >
          <Badge
            badgeContent={unreadCount}
            color="primary"
            max={99}
            invisible={unreadCount === 0}
          >
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>

        {/* Notification Dropdown Menu */}
        <Menu
          anchorEl={notifAnchorEl}
          open={notifMenuOpen}
          onClose={handleNotifClose}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1.5,
              width: 340,
              maxHeight: 450,
              borderRadius: 3,
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllRead}
                sx={{ textTransform: "none", fontSize: 12 }}
              >
                Mark all read
              </Button>
            )}
          </Box>

          <Divider />

          {loadingNotifs ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No notifications found
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((item) => (
                <ListItem
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: item.isRead ? "transparent" : "action.hover",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 32 }}>
                    {!item.isRead && (
                      <CircleIcon sx={{ fontSize: 10, color: "primary.main" }} />
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight={item.isRead ? 400 : 600}
                      >
                        {item.title || item.message}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Divider />

          <Box sx={{ p: 1, textAlign: "center" }}>
            <Button
              fullWidth
              size="small"
              onClick={() => {
                handleNotifClose();
                navigate("/notifications");
              }}
              sx={{ textTransform: "none" }}
            >
              View all notifications
            </Button>
          </Box>
        </Menu>

        {/* User Profile Trigger */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ cursor: "pointer", ml: { xs: 0, sm: 0.5 } }}
          onClick={(e) => setProfileAnchorEl(e.currentTarget)}
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

          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
              {userName}
            </Typography>
          </Box>

          <KeyboardArrowDownRoundedIcon
            sx={{
              display: { xs: "none", sm: "block" },
              color: "text.secondary",
            }}
          />
        </Stack>

        {/* Profile Menu Dropdown */}
        <Menu
          anchorEl={profileAnchorEl}
          open={profileMenuOpen}
          onClose={() => setProfileAnchorEl(null)}
          PaperProps={{
            elevation: 4,
            sx: { mt: 1, minWidth: 180, borderRadius: 2 },
          }}
        >
          <MenuItem
            onClick={() => {
              setProfileAnchorEl(null);
              navigate("/profile");
            }}
          >
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              setProfileAnchorEl(null);
              navigate("/settings");
            }}
          >
            Settings
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setProfileAnchorEl(null);
              navigate("/logout");
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardNavbar;