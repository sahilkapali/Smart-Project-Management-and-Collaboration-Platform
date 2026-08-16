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
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";

import { useLocation, useNavigate } from "react-router-dom";

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
  activeItem?: string;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardRoundedIcon />,
  },
  {
    label: "My Projects",
    path: "/projects",
    icon: <FolderRoundedIcon />,
  },
  {
    label: "Tasks & Deadlines",
    path: "/tasks",
    icon: <TaskAltRoundedIcon />,
  },
  {
    label: "Team Members",
    path: "/teams",
    icon: <GroupsRoundedIcon />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsRoundedIcon />,
  },
  {
    label: "Help Center",
    path: "/help",
    icon: <HelpOutlineRoundedIcon />,
  },
];

const DashboardSidebar = ({
  open = true,
  onClose,
}: DashboardSidebarProps) => {
  const theme = useTheme();

  const navigate = useNavigate();

  const location = useLocation();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("md"),
  );

  const handleNavigation = (path: string) => {
    navigate(path);

    if (isMobile) {
      onClose?.();
    }
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  if (isMobile && !open) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}

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

      {/* Sidebar */}

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
            xs: open
              ? "translateX(0)"
              : "translateX(-100%)",

            md: "translateX(0)",
          },

          transition: theme.transitions.create(
            "transform",
            {
              duration:
                theme.transitions.duration.shorter,
            },
          ),

          overflow: "hidden",
        }}
      >
        {/* Brand */}

        <Box
          sx={{
            px: 2.5,
            pt: 3,
            pb: 2.5,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,

                bgcolor:
                  "rgba(255,255,255,0.16)",

                border:
                  "1px solid rgba(255,255,255,0.22)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                fontWeight: 800,
                fontSize: 18,
              }}
            >
              S
            </Box>

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

            {/* Mobile close button */}

            {isMobile && (
              <ButtonBase
                onClick={onClose}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  color: "inherit",
                }}
              >
                <CloseRoundedIcon />
              </ButtonBase>
            )}
          </Stack>
        </Box>

        <Divider
          sx={{
            borderColor:
              "rgba(255,255,255,0.12)",
          }}
        />

        {/* Navigation */}

        <List
          disablePadding
          sx={{
            px: 1.5,
            py: 2,
          }}
        >
          {navigationItems.map((item) => {
            const active = isActive(item.path);

            return (
              <ListItemButton
                key={item.path}
                selected={active}
                onClick={() =>
                  handleNavigation(item.path)
                }
                sx={{
                  minHeight: 48,
                  mb: 0.5,
                  px: 1.5,

                  borderRadius: 2,

                  color:
                    "primary.contrastText",

                  "& .MuiListItemIcon-root": {
                    minWidth: 38,
                    color: "inherit",
                  },

                  "&.Mui-selected": {
                    bgcolor:
                      "rgba(0,0,0,0.18)",
                  },

                  "&.Mui-selected:hover": {
                    bgcolor:
                      "rgba(0,0,0,0.24)",
                  },

                  "&:hover": {
                    bgcolor:
                      "rgba(255,255,255,0.10)",
                  },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: active
                      ? 700
                      : 500,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        {/* Flexible space */}

        <Box sx={{ flex: 1 }} />

        {/* Collaboration Tips */}

        <Paper
          elevation={0}
          sx={{
            mx: 1.5,
            mb: 2,
            p: 1.75,

            borderRadius: 2.5,

            bgcolor:
              "rgba(255,255,255,0.12)",

            color: "inherit",

            border:
              "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <TipsAndUpdatesRoundedIcon
              sx={{ fontSize: 20 }}
            />

            <Typography
              variant="body2"
              fontWeight={700}
            >
              Collaboration Tips
            </Typography>
          </Stack>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              opacity: 0.82,
              lineHeight: 1.5,
            }}
          >
            Keep your projects, tasks and
            team activities organized in one
            place.
          </Typography>
        </Paper>

        {/* Logout */}

        <Box sx={{ px: 1.5, pb: 2.5 }}>
          <ListItemButton
            onClick={() =>
              handleNavigation("/logout")
            }
            sx={{
              minHeight: 46,
              borderRadius: 2,

              justifyContent: "center",

              color:
                "primary.contrastText",

              "&:hover": {
                bgcolor:
                  "rgba(255,255,255,0.10)",
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
              primary="Logout"
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