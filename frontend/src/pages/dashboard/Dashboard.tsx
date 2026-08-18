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
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";

import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import ProjectActivityChart from "../../components/dashboard/ProjectActivityChart";
import TaskList from "../../components/dashboard/TaskList";
import ProjectTimeline from "../../components/dashboard/ProjectTimeline";

import dashboardService, {
  type DashboardMetrics,
} from "../../services/dashboard.service";

const Dashboard = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await dashboardService.getMetrics();

        if (isMounted) {
          setMetrics(data);
        }
      } catch (err: unknown) {
        console.error("Dashboard loading failed:", err);

        const axiosError = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
          message?: string;
        };

        if (isMounted) {
          setError(
            axiosError.response?.data?.message ||
              axiosError.message ||
              "Unable to load dashboard data.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">Loading dashboard...</Typography>
        </Stack>
      </Box>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // ============================================================
  // NO DATA
  // ============================================================

  if (!metrics) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        <Alert severity="info">No dashboard data available.</Alert>
      </Box>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* ======================================================
          WELCOME HEADER
      ======================================================= */}

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

      {/* ======================================================
          PRIMARY STAT CARDS
      ======================================================= */}

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
        {/* ACTIVE PROJECTS */}

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

        {/* OVERDUE TASKS */}

        <DashboardStatCard
          title="Overdue Tasks"
          value={metrics.overdueTasks}
          subtitle="Tasks requiring attention"
          icon={<CalendarMonthRoundedIcon fontSize="small" />}
        />

        {/* REPOSITORIES */}

        <DashboardStatCard
          title="Repositories"
          value={metrics.repositoriesCount}
          subtitle="Available repositories"
          icon={<FolderRoundedIcon fontSize="small" />}
        />
      </Box>

      {/* ======================================================
          SECONDARY METRICS
      ======================================================= */}

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
        {/* COMPLETED TASKS */}

        <SmallMetric
          icon={<CalendarMonthRoundedIcon fontSize="small" />}
          title="Completed Tasks"
          value={metrics.completedTasks}
        />

        {/* PENDING TASKS */}

        <SmallMetric
          icon={<CalendarMonthRoundedIcon fontSize="small" />}
          title="Pending Tasks"
          value={metrics.pendingTodoTasks}
        />

        {/* OPEN ISSUES */}

        <SmallMetric
          icon={<BugReportRoundedIcon fontSize="small" />}
          title="Open Issues"
          value={metrics.openIssues}
        />
      </Box>

      {/* ======================================================
          TASKS + PROJECT TIMELINE
      ======================================================= */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.55fr) minmax(320px, 0.85fr)",
          },
          gap: 2,
          mb: 2,
        }}
      >
        <TaskList tasks={[]} />

        <ProjectTimeline />
      </Box>

      {/* ======================================================
          ADDITIONAL METRICS
      ======================================================= */}

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
        {/* REPOSITORIES */}

        <SmallMetric
          icon={<FolderRoundedIcon fontSize="small" />}
          title="Repositories"
          value={metrics.repositoriesCount}
        />

        {/* TOTAL ISSUES */}

        <SmallMetric
          icon={<BugReportRoundedIcon fontSize="small" />}
          title="Total Issues"
          value={metrics.totalIssues}
        />

        {/* RESOLVED ISSUES */}

        <SmallMetric
          icon={<BugReportRoundedIcon fontSize="small" />}
          title="Resolved Issues"
          value={metrics.resolvedIssues}
        />

        {/* UPCOMING MEETINGS */}

        <SmallMetric
          icon={<EventRoundedIcon fontSize="small" />}
          title="Upcoming Meetings"
          value={metrics.upcomingMeetings}
        />
      </Box>
    </Box>
  );
};

// ============================================================
// SMALL METRIC CARD
// ============================================================

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
      {/* HEADER */}

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

      {/* VALUE */}

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
