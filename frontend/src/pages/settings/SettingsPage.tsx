import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  ExpandMore as ExpandMoreIcon,
  PaletteOutlined,
  HelpOutlineOutlined,
  InfoOutlined,
  PersonOutlineOutlined,
  WbSunnyOutlined,
  DarkModeOutlined,
  SettingsBrightnessOutlined,
  ArrowBack,
  EmailOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAppTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

type SettingsTab = "account" | "appearance" | "help" | "about";

interface LocalSettings {}

const SETTINGS_STORAGE_KEY = "frontend-settings";

const DEFAULT_SETTINGS: LocalSettings = {};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const { mode, setMode } = useAppTheme();

  const { user } = useAuth() as any;

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const [settings, setSettings] = useState<LocalSettings>(DEFAULT_SETTINGS);

  const [isLoaded, setIsLoaded] = useState(false);

  /*
   * ============================================================
   * LOAD FRONTEND SETTINGS
   * ============================================================
   */

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);

        if (parsedSettings && typeof parsedSettings === "object") {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsedSettings,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);

      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /*
   * ============================================================
   * SAVE FRONTEND SETTINGS
   * ============================================================
   */

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [settings, isLoaded]);

  /*
   * ============================================================
   * USER INFORMATION
   * ============================================================
   */

  const firstName = user?.firstName ?? "";

  const lastName = user?.lastName ?? "";

  const fullName = `${firstName} ${lastName}`.trim() || "User";

  const email = user?.email ?? "Email not available";

  const role = user?.role ?? "User";

  /*
   * ============================================================
   * AVATAR
   * ============================================================
   */

  const avatarLetter =
    firstName?.charAt(0)?.toUpperCase() ||
    email?.charAt(0)?.toUpperCase() ||
    "U";

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  const navigationItems = [
    {
      id: "account" as SettingsTab,
      label: "Account",
      description: "Your account information",
      icon: <PersonOutlineOutlined />,
    },
    {
      id: "appearance" as SettingsTab,
      label: "Appearance",
      description: "Theme and display",
      icon: <PaletteOutlined />,
    },
    {
      id: "help" as SettingsTab,
      label: "Help & Support",
      description: "FAQs and support information",
      icon: <HelpOutlineOutlined />,
    },
    {
      id: "about" as SettingsTab,
      label: "About",
      description: "Application information",
      icon: <InfoOutlined />,
    },
  ];

  /*
   * ============================================================
   * THEME CARD
   * ============================================================
   */

  const ThemeCard = ({
    value,
    title,
    description,
    icon,
  }: {
    value: "light" | "dark" | "system";
    title: string;
    description: string;
    icon: React.ReactNode;
  }) => {
    const selected = mode === value;

    return (
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          borderRadius: 3,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? "primary.main" : "divider",
          transition: "all 0.2s ease",

          "&:hover": {
            borderColor: "primary.main",
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardActionArea
          onClick={() => {
            setMode(value);

            toast.success(`${title} theme selected.`);
          }}
          sx={{
            height: "100%",
            p: 2,
          }}
        >
          <CardContent
            sx={{
              p: 0,

              "&:last-child": {
                pb: 0,
              },
            }}
          >
            <Stack alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  color: selected ? "primary.main" : "text.secondary",
                }}
              >
                {icon}
              </Box>

              <Typography fontWeight={700} variant="subtitle1">
                {title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                {description}
              </Typography>

              {selected && (
                <Chip label="Selected" size="small" color="primary" />
              )}
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        py: {
          xs: 2,
          md: 4,
        },
      }}
    >
      {/* ======================================================
          HEADER
         ====================================================== */}

      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton
          onClick={() => navigate("/dashboard")}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <ArrowBack />
        </IconButton>

        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              fontSize: {
                xs: "1.7rem",
                sm: "2rem",
                md: "2.2rem",
              },
            }}
          >
            Settings
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage your account and application preferences.
          </Typography>
        </Box>
      </Stack>

      {/* ======================================================
          MAIN SETTINGS PANEL
         ====================================================== */}

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Grid container>
          {/* ==================================================
              SIDEBAR
             ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 3.5,
            }}
            sx={{
              borderRight: {
                xs: 0,
                md: 1,
              },

              borderBottom: {
                xs: 1,
                md: 0,
              },

              borderColor: "divider",

              p: {
                xs: 1,
                md: 2,
              },
            }}
          >
            <List disablePadding>
              {navigationItems.map((item) => {
                const selected = activeTab === item.id;

                return (
                  <ListItemButton
                    key={item.id}
                    selected={selected}
                    onClick={() => setActiveTab(item.id)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.75,
                      py: 1.25,

                      "&.Mui-selected": {
                        bgcolor: "action.selected",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 42,

                        color: selected ? "primary.main" : "text.secondary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontWeight: selected ? 700 : 500,
                        fontSize: "0.95rem",
                      }}
                      secondaryTypographyProps={{
                        fontSize: "0.75rem",

                        sx: {
                          display: {
                            xs: "none",
                            sm: "block",
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Grid>

          {/* ==================================================
              CONTENT
             ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 8.5,
            }}
            sx={{
              p: {
                xs: 2,
                sm: 3,
                md: 4,
              },
            }}
          >
            {/* =================================================
                ACCOUNT
               ================================================= */}

            {activeTab === "account" && (
              <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  Account
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={3}>
                  View your account information.
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: {
                      xs: 2,
                      sm: 3,
                    },

                    borderRadius: 3,
                  }}
                >
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    alignItems={{
                      xs: "center",
                      sm: "flex-start",
                    }}
                    spacing={2.5}
                  >
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        bgcolor: "primary.main",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                      }}
                    >
                      {avatarLetter}
                    </Avatar>

                    <Box
                      sx={{
                        textAlign: {
                          xs: "center",
                          sm: "left",
                        },

                        flex: 1,
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {fullName}
                      </Typography>

                      <Stack
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
                        spacing={1}
                        alignItems="center"
                        mt={0.5}
                      >
                        <EmailOutlined
                          sx={{
                            fontSize: 18,
                            color: "text.secondary",
                          }}
                        />

                        <Typography variant="body2" color="text.secondary">
                          {email}
                        </Typography>
                      </Stack>

                      <Chip
                        label={role}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          mt: 1.5,
                        }}
                      />
                    </Box>
                  </Stack>
                </Paper>

                <Alert
                  severity="info"
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                  }}
                >
                  Account information is managed by your application
                  authentication system.
                </Alert>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                  }}
                ></Box>
              </Box>
            )}

            {/* =================================================
                APPEARANCE
               ================================================= */}

            {activeTab === "appearance" && (
              <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  Appearance
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={3}>
                  Choose how the application should look. Your choice is saved
                  automatically.
                </Typography>

                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <ThemeCard
                      value="light"
                      title="Light"
                      description="Use a bright interface."
                      icon={
                        <WbSunnyOutlined
                          sx={{
                            fontSize: 28,
                          }}
                        />
                      }
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <ThemeCard
                      value="dark"
                      title="Dark"
                      description="Use a darker interface."
                      icon={
                        <DarkModeOutlined
                          sx={{
                            fontSize: 28,
                          }}
                        />
                      }
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <ThemeCard
                      value="system"
                      title="System"
                      description="Follow your device theme."
                      icon={
                        <SettingsBrightnessOutlined
                          sx={{
                            fontSize: 28,
                          }}
                        />
                      }
                    />
                  </Grid>
                </Grid>

                <Divider
                  sx={{
                    my: 4,
                  }}
                />

                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                  Current theme
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {mode === "system"
                    ? "System theme"
                    : mode === "light"
                      ? "Light theme"
                      : "Dark theme"}
                </Typography>
              </Box>
            )}

            {/* =================================================
                HELP & SUPPORT
               ================================================= */}

            {activeTab === "help" && (
              <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  Help & Support
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={3}>
                  Find answers to common questions and learn how to use the
                  application.
                </Typography>

                {/* FAQ */}

                <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
                  Frequently Asked Questions
                </Typography>

                <Stack spacing={1}>
                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      "&:before": {
                        display: "none",
                      },
                      "&:first-of-type": {
                        borderRadius: 2,
                      },
                      "&:last-of-type": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        How do I manage my projects?
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                        }}
                      >
                        Open the Projects section from the application
                        navigation. From there you can view your projects and
                        access the available project management features.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      "&:before": {
                        display: "none",
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        How do I manage my teams?
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                        }}
                      >
                        Open the Teams section to view and manage the teams
                        available to your account. Team permissions depend on
                        your assigned role.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      "&:before": {
                        display: "none",
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        How do I change the application theme?
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                        }}
                      >
                        Open Appearance from Settings and choose Light, Dark, or
                        System. The selected theme is saved automatically in
                        your browser.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      "&:before": {
                        display: "none",
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        What should I do if something is not working?
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                        }}
                      >
                        First, refresh the application and check your internet
                        connection. If the issue continues, contact your project
                        administrator and provide details about the problem.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      "&:before": {
                        display: "none",
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        Who should I contact for account problems?
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                        }}
                      >
                        For account, authentication, or access problems, contact
                        your project administrator.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </Stack>

                <Divider
                  sx={{
                    my: 4,
                  }}
                />

                {/* GETTING STARTED */}

                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                  Getting Started
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: {
                      xs: 2,
                      sm: 3,
                    },
                  }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography fontWeight={600} gutterBottom>
                        1. Explore your dashboard
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Use the dashboard to get an overview of your projects,
                        teams, and current activities.
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography fontWeight={600} gutterBottom>
                        2. Create or manage projects
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Use the project management features to organize project
                        information and track progress.
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography fontWeight={600} gutterBottom>
                        3. Collaborate with your team
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Use teams and collaboration features to work with other
                        members of your project.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Divider
                  sx={{
                    my: 4,
                  }}
                />

                {/* SUPPORT INFORMATION */}

                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                  Support Information
                </Typography>

                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  If you need additional assistance with your account, project
                  access, or application functionality, please contact your
                  project administrator.
                </Alert>
              </Box>
            )}

            {/* =================================================
                ABOUT
               ================================================= */}

            {activeTab === "about" && (
              <Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  About
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={3}>
                  Information about this application.
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 3,

                    p: {
                      xs: 2,
                      sm: 3,
                    },
                  }}
                >
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={2}
                    alignItems={{
                      xs: "flex-start",
                      sm: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <SettingsOutlined
                        sx={{
                          fontSize: 32,
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Smart Project Management
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Project management and collaboration platform.
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider
                    sx={{
                      my: 3,
                    }}
                  />

                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      gap={2}
                    >
                      <Typography color="text.secondary">Version</Typography>

                      <Typography fontWeight={600}>1.0.0</Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      gap={2}
                    >
                      <Typography color="text.secondary">Platform</Typography>

                      <Typography fontWeight={600}>Web Application</Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      gap={2}
                    >
                      <Typography color="text.secondary">
                        UI Framework
                      </Typography>

                      <Typography fontWeight={600}>Material UI</Typography>
                    </Stack>
                  </Stack>
                </Paper>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 3,
                    lineHeight: 1.7,
                  }}
                >
                  Smart Project Management is designed to help teams organize
                  projects, manage work, collaborate, and monitor project
                  progress from one place.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
