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

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const menuOpen = Boolean(anchorEl);

  const handleProfileClick = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    handleClose();
    navigate(path);
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
        {/* Mobile menu */}

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

        {/* Search */}

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

              bgcolor:
                "background.default",
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
                  color:
                    theme.palette.text
                      .secondary,
                },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Notifications */}

        <IconButton
          aria-label="Notifications"
          onClick={() =>
            navigate("/notifications")
          }
          sx={{
            color: "text.primary",
          }}
        >
          <Badge
            badgeContent={3}
            color="primary"
            max={99}
          >
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>

        {/* User */}

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
            alt={userName}
            sx={{
              width: 38,
              height: 38,

              bgcolor:
                "primary.main",

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
            <Typography
              variant="body2"
              fontWeight={700}
              lineHeight={1.2}
            >
              {userName}
            </Typography>
          </Box>

          <KeyboardArrowDownRoundedIcon
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },

              color:
                "text.secondary",
            }}
          />
        </Stack>

        {/* Profile menu */}

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleClose}
          PaperProps={{
            elevation: 4,

            sx: {
              mt: 1,
              minWidth: 180,
              borderRadius: 2,
            },
          }}
        >
          <MenuItem
            onClick={() =>
              handleNavigation("/profile")
            }
          >
            Profile
          </MenuItem>

          <MenuItem
            onClick={() =>
              handleNavigation("/settings")
            }
          >
            Settings
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={() =>
              handleNavigation("/logout")
            }
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardNavbar;