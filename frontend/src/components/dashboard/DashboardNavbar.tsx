import { useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  InputBase,
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

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

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

  const { logout, user } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [loggingOut, setLoggingOut] = useState(false);

  const menuOpen = Boolean(anchorEl);

  // ==================== PROFILE MENU ====================

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // ==================== NAVIGATION ====================

  const handleNavigation = (path: string) => {
    handleClose();
    navigate(path);
  };

  // ==================== LOGOUT ====================

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      // Close profile menu
      handleClose();

      // Call AuthContext logout
      await logout();

      // Show success message
      toast.success("Logged out successfully.");

      // Redirect to login page
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

  // ==================== USER INFORMATION ====================

  const displayName =
    userName !== "User"
      ? userName
      : user
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User"
        : "User";

  const initials = displayName
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
        {/* ==================== MOBILE MENU ==================== */}

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

        {/* ==================== SEARCH ==================== */}

        <Box
          sx={{
            flex: 1,
            maxWidth: 360,

            display: {
              xs: "none",
              sm: "block",
            },
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
            <SearchRoundedIcon
              sx={{
                color: "text.secondary",
                fontSize: 21,
                mr: 1,
              }}
            />

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

        {/* ==================== NOTIFICATIONS ==================== */}

        <IconButton
          aria-label="Notifications"
          onClick={() => navigate("/notifications")}
          sx={{
            color: "text.primary",
          }}
        >
          <Badge badgeContent={3} color="primary" max={99}>
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>

        {/* ==================== USER ==================== */}

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
          }}
          onClick={handleProfileClick}
        >
          <Avatar
            src={userAvatar}
            alt={displayName}
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
              {displayName}
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

        {/* ==================== PROFILE MENU ==================== */}

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleClose}
          PaperProps={{
            elevation: 4,

            sx: {
              mt: 1,
              minWidth: 200,
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

          {/* ==================== LOGOUT ==================== */}

          <MenuItem
            onClick={handleLogout}
            disabled={loggingOut}
            sx={{
              color: "error.main",
              fontWeight: 600,
            }}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardNavbar;
