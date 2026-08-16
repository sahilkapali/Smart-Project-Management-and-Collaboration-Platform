import { useEffect, useState, type ReactNode } from "react";

import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";

import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import ProjectActivityChart from "../../components/dashboard/ProjectActivityChart";
import TaskList from "../../components/dashboard/TaskList";
import ProjectTimeline from "../../components/dashboard/ProjectTimeline";
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

import dashboardService, {
  type DashboardMetrics,
} from "../../services/dashboard.service";

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await dashboardService.getMetrics();

        setMetrics(data);
      } catch (err: unknown) {
        console.error("Dashboard loading failed:", err);

        const axiosError = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        setError(
          axiosError?.response?.data?.message ||
            "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "background.default",
      }}
    >
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <DashboardNavbar onMenuClick={() => setSidebarOpen(true)} />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            md: "250px",
          },

          pt: {
            xs: "80px",
            md: "88px",
          },

          px: {
            xs: 1.5,
            sm: 2,
            md: 3,
          },

          pb: 4,

          minHeight: "100vh",

          boxSizing: "border-box",
        }}
      >
        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading && (
          <Box
            sx={{
              minHeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* ===================================================
            ERROR
        ==================================================== */}

        {!loading && error && (
          <Box sx={{ pt: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/* ===================================================
            NO DATA
        ==================================================== */}

        {!loading && !error && !metrics && (
          <Box sx={{ pt: 2 }}>
            <Alert severity="info">No dashboard data available.</Alert>
          </Box>
        )}

        {/* ===================================================
            DASHBOARD
        ==================================================== */}

        {!loading && !error && metrics && (
          <>
            {/* ============================================
                  WELCOME HEADER
              ============================================= */}

            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: {
                    xs: "1.65rem",
                    sm: "1.85rem",
                    md: "2rem",
                  },
                  fontWeight: 500,
                  lineHeight: 1.15,
                }}
              >
                Hello!
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: "1.65rem",
                    sm: "1.85rem",
                    md: "2rem",
                  },
                  fontWeight: 700,
                  lineHeight: 1.15,
                }}
              >
                Welcome Back 👋
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mt: 0.75,
                }}
              >
                Here's what's happening with your projects.
              </Typography>
            </Box>

            {/* ============================================
                  PRIMARY STAT CARDS
              ============================================= */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },

                gap: 2,

                mb: 2,
              }}
            >
              {/* Active Projects */}

              <DashboardStatCard
                title="Active Projects"
                value={metrics.totalProjects}
                subtitle="Projects you can access"
                icon={<BarChartRoundedIcon fontSize="small" />}
                chart={
                  metrics.totalProjects > 0 ? (
                    <ProjectActivityChart value={metrics.totalProjects} />
                  ) : undefined
                }
              />

              {/* Tasks Due Today */}

              <DashboardStatCard
                title="Tasks Due Today"
                value={metrics.overdueTasks}
                subtitle="Tasks requiring attention"
                icon={<CalendarMonthRoundedIcon fontSize="small" />}
              />

              {/* Team Availability */}

              <DashboardStatCard
                title="Team Availability"
                value={metrics.repositoriesCount}
                subtitle="Repository resources"
                icon={<GroupsRoundedIcon fontSize="small" />}
              />
            </Box>

            {/* ============================================
                  SECONDARY METRICS
              ============================================= */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },

                gap: 2,

                mb: 2,
              }}
            >
              <SmallMetric
                icon={<CalendarMonthRoundedIcon fontSize="small" />}
                title="Completed Tasks"
                value={metrics.completedTasks}
              />

              <SmallMetric
                icon={<CalendarMonthRoundedIcon fontSize="small" />}
                title="Pending Tasks"
                value={metrics.pendingTodoTasks}
              />

              <SmallMetric
                icon={<BugReportRoundedIcon fontSize="small" />}
                title="Open Issues"
                value={metrics.openIssues}
              />
            </Box>

            {/* ============================================
                  TASK LIST + PROJECT TIMELINE
              ============================================= */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "minmax(0, 1.55fr) minmax(340px, 0.85fr)",
                },

                gap: 2,

                mb: 2,
              }}
            >
              {/* 
                  No temporary task data.
                  Backend task data can be passed here
                  when available.
                */}

              <TaskList tasks={[]} />

              {/* 
                  ProjectTimeline already handles
                  empty data by showing:
                  "No timeline data available"
                */}

              <ProjectTimeline />
            </Box>

            {/* ============================================
                  ADDITIONAL METRICS
              ============================================= */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(4, 1fr)",
                },

                gap: 2,
              }}
            >
              <SmallMetric
                icon={<FolderRoundedIcon fontSize="small" />}
                title="Repositories"
                value={metrics.repositoriesCount}
              />

              <SmallMetric
                icon={<BugReportRoundedIcon fontSize="small" />}
                title="Total Issues"
                value={metrics.totalIssues}
              />

              <SmallMetric
                icon={<BugReportRoundedIcon fontSize="small" />}
                title="Resolved Issues"
                value={metrics.resolvedIssues}
              />

              <SmallMetric
                icon={<EventRoundedIcon fontSize="small" />}
                title="Upcoming Meetings"
                value={metrics.upcomingMeetings}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

/* ============================================================
   SMALL METRIC CARD
============================================================ */

interface SmallMetricProps {
  title: string;
  value: number;
  icon: ReactNode;
}

const SmallMetric = ({ title, value, icon }: SmallMetricProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,

        minHeight: 105,

        borderRadius: 3,

        border: "1px solid",
        borderColor: "divider",

        bgcolor: "background.paper",

        transition: "box-shadow 0.2s ease, transform 0.2s ease",

        "&:hover": {
          boxShadow: 2,
          transform: "translateY(-1px)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 34,
            height: 34,

            flexShrink: 0,

            borderRadius: 2,

            bgcolor: "action.hover",

            color: "primary.main",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </Stack>

      <Typography
        variant="h5"
        fontWeight={700}
        sx={{
          mt: 1,
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
};

export default Dashboard;
