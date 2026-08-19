import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";

import DashboardStatCard from "../../components/dashboard/DashboardStatCard";

import ProjectActivityChart from "../../components/dashboard/ProjectActivityChart";

import TaskList, {
  type DashboardTask,
} from "../../components/dashboard/TaskList";

import ProjectTimeline, {
  type TimelineProject,
} from "../../components/dashboard/ProjectTimeline";

import DashboardDetailsDialog, {
  type DashboardDialogType,
} from "../../components/dashboard/DashboardDetailsDialog";

import dashboardService, {
  type DashboardData,
} from "../../services/dashboard.service";

import { useAuth } from "../../context/AuthContext";

import type { Project } from "../../types/project.types";

import type { Repository } from "../../types/repository.types";

import type { Issue } from "../../types/issue.types";

import type { Meeting } from "../../types/meeting.types";

/* ============================================================
   DASHBOARD
============================================================ */

const Dashboard = () => {
  const { user } = useAuth();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<DashboardData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  /* ==========================================================
     DIALOG STATE
  ========================================================== */

  const [
    dialogType,
    setDialogType,
  ] =
    useState<DashboardDialogType | null>(
      null,
    );

  const [
    dialogTitle,
    setDialogTitle,
  ] =
    useState("");

  const [
    selectedProject,
    setSelectedProject,
  ] =
    useState<Project | null>(
      null,
    );

  const [
    selectedTask,
    setSelectedTask,
  ] =
    useState<DashboardTask | null>(
      null,
    );

  const [
    selectedRepository,
    setSelectedRepository,
  ] =
    useState<Repository | null>(
      null,
    );

  const [
    selectedIssue,
    setSelectedIssue,
  ] =
    useState<Issue | null>(
      null,
    );

  const [
    selectedMeeting,
    setSelectedMeeting,
  ] =
    useState<Meeting | null>(
      null,
    );

  /* ==========================================================
     LOAD DASHBOARD
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadDashboard =
      async () => {
        try {
          setLoading(true);

          setError("");

          const data =
            await dashboardService.getDashboardData();

          if (mounted) {
            setDashboard(data);
          }
        } catch (err: unknown) {
          console.error(
            "Dashboard loading failed:",
            err,
          );

          const axiosError =
            err as {
              response?: {
                data?: {
                  message?: string;
                };
              };

              message?: string;
            };

          if (mounted) {
            setError(
              axiosError.response
                ?.data?.message ||
                axiosError.message ||
                "Unable to load dashboard data.",
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     METRICS
  ========================================================== */

  const metrics =
    dashboard?.metrics;

  /* ==========================================================
     TASKS
  ========================================================== */

  const dashboardTasks =
    useMemo(() => {
      if (!dashboard) {
        return [];
      }

      return dashboardService.toDashboardTasks(
        dashboard.tasks,
        dashboard.projects,
      );
    }, [dashboard]);

  /* ==========================================================
     TIMELINE
  ========================================================== */

  const timelineProjects =
    useMemo<TimelineProject[]>(
      () => {
        if (!dashboard) {
          return [];
        }

        return dashboard.projects
          .filter(
            (project) =>
              project.startDate &&
              project.endDate,
          )
          .slice(0, 7)
          .map(
            (project) => ({
              id: project.id,

              name: project.name,

              startDate:
                project.startDate as string,

              endDate:
                project.endDate as string,
            }),
          );
      },
      [dashboard],
    );

  /* ==========================================================
     DISPLAY NAME
  ========================================================== */

  const displayName =
    user?.firstName ||
    dashboard?.user.firstName ||
    dashboard?.user.email ||
    "User";

  /* ==========================================================
     ROLE
  ========================================================== */

  const roleLabel =
    getRoleLabel(
      user?.role ??
        dashboard?.user.role,
    );

  /* ==========================================================
     OPEN DIALOG
  ========================================================== */

  const openDialog = (
    type: DashboardDialogType,
    title: string,
  ) => {
    setDialogType(type);

    setDialogTitle(title);
  };

  /* ==========================================================
     CLOSE DIALOG
  ========================================================== */

  const closeDialog = () => {
    setDialogType(null);

    setDialogTitle("");

    setSelectedProject(null);

    setSelectedTask(null);

    setSelectedRepository(null);

    setSelectedIssue(null);

    setSelectedMeeting(null);
  };

  /* ==========================================================
     OPEN PROJECT
  ========================================================== */

  const handleProjectClick = (
    project: Project,
  ) => {
    setSelectedProject(project);

    openDialog(
      "project",
      project.name,
    );
  };

  /* ==========================================================
     OPEN TASK
  ========================================================== */

  const handleTaskClick = (
    task: DashboardTask,
  ) => {
    setSelectedTask(task);

    openDialog(
      "task",
      task.title,
    );
  };

  /* ==========================================================
     OPEN REPOSITORY
  ========================================================== */

  const handleRepositoryClick = (
    repository: Repository,
  ) => {
    setSelectedRepository(
      repository,
    );

    openDialog(
      "repository",
      repository.name,
    );
  };

  /* ==========================================================
     OPEN ISSUE
  ========================================================== */

  const handleIssueClick = (
    issue: Issue,
  ) => {
    setSelectedIssue(issue);

    openDialog(
      "issue",
      issue.title,
    );
  };

  /* ==========================================================
     OPEN MEETING
  ========================================================== */

  const handleMeetingClick = (
    meeting: Meeting,
  ) => {
    setSelectedMeeting(meeting);

    openDialog(
      "meeting",
      meeting.title,
    );
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight:
            "70vh",

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "center",
        }}
      >
        <Stack
          alignItems="center"
          spacing={2}
        >
          <CircularProgress />

          <Typography color="text.secondary">
            Loading your
            role-based
            dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <Box
        sx={{
          width: "100%",

          maxWidth: 1400,

          mx: "auto",
        }}
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  /* ==========================================================
     EMPTY
  ========================================================== */

  if (
    !dashboard ||
    !metrics
  ) {
    return (
      <Box
        sx={{
          width: "100%",

          maxWidth: 1400,

          mx: "auto",
        }}
      >
        <Alert severity="info">
          No dashboard
          data available.
        </Alert>
      </Box>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <Box
        sx={{
          width: "100%",

          maxWidth: 1400,

          mx: "auto",
        }}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

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
            Hello, {displayName}!
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
            {getRoleMessage(
              roleLabel,
            )}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              mt: 1.5,

              flexWrap:
                "wrap",
            }}
          >
            <RoleBadge
              icon={
                <GroupsRoundedIcon fontSize="small" />
              }
              label={
                roleLabel
              }
            />

            <RoleBadge
              icon={
                <FolderRoundedIcon fontSize="small" />
              }
              label={`${metrics.totalProjects} accessible projects`}
            />
          </Stack>
        </Box>

        {/* ====================================================
            PRIMARY CARDS
        ==================================================== */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns:
              {
                xs: "1fr",

                sm: "repeat(2, 1fr)",

                lg: "repeat(3, 1fr)",
              },

            gap: 2,

            mb: 2,
          }}
        >
          <DashboardStatCard
            title="Accessible Projects"
            value={
              metrics.totalProjects
            }
            subtitle="Click to view your accessible projects"
            icon={
              <BarChartRoundedIcon fontSize="small" />
            }
            chart={
              metrics.totalProjects >
              0 ? (
                <ProjectActivityChart
                  value={
                    metrics.totalProjects
                  }
                />
              ) : undefined
            }
            onClick={() =>
              openDialog(
                "projects",
                "Accessible Projects",
              )
            }
          />

          <DashboardStatCard
            title="Overdue Tasks"
            value={
              metrics.overdueTasks
            }
            subtitle="Click to view overdue tasks"
            icon={
              <CalendarMonthRoundedIcon fontSize="small" />
            }
            onClick={() =>
              openDialog(
                "overdueTasks",
                "Overdue Tasks",
              )
            }
          />

          <DashboardStatCard
            title="Repositories"
            value={
              metrics.repositoriesCount
            }
            subtitle="Click to view repositories"
            icon={
              <FolderRoundedIcon fontSize="small" />
            }
            onClick={() =>
              openDialog(
                "repositories",
                "Repositories",
              )
            }
          />
        </Box>

        {/* ====================================================
            SECONDARY CARDS
        ==================================================== */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns:
              {
                xs: "1fr",

                sm: "repeat(2, 1fr)",

                lg: "repeat(3, 1fr)",
              },

            gap: 2,

            mb: 2,
          }}
        >
          <SmallMetric
            icon={
              <TaskAltRoundedIcon fontSize="small" />
            }
            title="Completed Tasks"
            value={
              metrics.completedTasks
            }
            onClick={() =>
              openDialog(
                "completedTasks",
                "Completed Tasks",
              )
            }
          />

          <SmallMetric
            icon={
              <CalendarMonthRoundedIcon fontSize="small" />
            }
            title="Pending Tasks"
            value={
              metrics.pendingTodoTasks
            }
            onClick={() =>
              openDialog(
                "pendingTasks",
                "Pending Tasks",
              )
            }
          />

          <SmallMetric
            icon={
              <BugReportRoundedIcon fontSize="small" />
            }
            title="Open Issues"
            value={
              metrics.openIssues
            }
            onClick={() =>
              openDialog(
                "openIssues",
                "Open Issues",
              )
            }
          />
        </Box>

        {/* ====================================================
            TASKS + TIMELINE
        ==================================================== */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns:
              {
                xs: "1fr",

                lg: "minmax(0, 1.55fr) minmax(320px, 0.85fr)",
              },

            gap: 2,

            mb: 2,
          }}
        >
          <TaskList
            tasks={
              dashboardTasks
            }
            onTaskClick={
              handleTaskClick
            }
          />

          <ProjectTimeline
            projects={
              timelineProjects
            }
            onProjectClick={(
              timelineProject,
            ) => {
              const project =
                dashboard.projects.find(
                  (item) =>
                    item.id ===
                    timelineProject.id,
                );

              if (project) {
                handleProjectClick(
                  project,
                );
              }
            }}
          />
        </Box>

        {/* ====================================================
            LOWER METRICS
        ==================================================== */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns:
              {
                xs: "1fr",

                sm: "repeat(2, 1fr)",

                lg: "repeat(4, 1fr)",
              },

            gap: 2,
          }}
        >
          <SmallMetric
            icon={
              <FolderRoundedIcon fontSize="small" />
            }
            title="Repositories"
            value={
              metrics.repositoriesCount
            }
            onClick={() =>
              openDialog(
                "repositories",
                "Repositories",
              )
            }
          />

          <SmallMetric
            icon={
              <BugReportRoundedIcon fontSize="small" />
            }
            title="Total Issues"
            value={
              metrics.totalIssues
            }
            onClick={() =>
              openDialog(
                "issues",
                "All Accessible Issues",
              )
            }
          />

          <SmallMetric
            icon={
              <BugReportRoundedIcon fontSize="small" />
            }
            title="Resolved Issues"
            value={
              metrics.resolvedIssues
            }
            onClick={() =>
              openDialog(
                "resolvedIssues",
                "Resolved Issues",
              )
            }
          />

          <SmallMetric
            icon={
              <EventRoundedIcon fontSize="small" />
            }
            title="Upcoming Meetings"
            value={
              metrics.upcomingMeetings
            }
            onClick={() =>
              openDialog(
                "meetings",
                "Upcoming Meetings",
              )
            }
          />
        </Box>
      </Box>

      {/* ======================================================
          DETAILS DIALOG
      ====================================================== */}

      <DashboardDetailsDialog
        open={
          dialogType !== null
        }
        type={dialogType}
        title={
          dialogTitle
        }
        projects={
          dashboard.projects
        }
        tasks={
          dashboardTasks
        }
        repositories={
          dashboard.repositories
        }
        issues={
          dashboard.issues
        }
        meetings={
          dashboard.meetings
        }
        selectedProject={
          selectedProject
        }
        selectedTask={
          selectedTask
        }
        selectedRepository={
          selectedRepository
        }
        selectedIssue={
          selectedIssue
        }
        selectedMeeting={
          selectedMeeting
        }
        onClose={
          closeDialog
        }
        onProjectClick={
          handleProjectClick
        }
        onTaskClick={
          handleTaskClick
        }
        onRepositoryClick={
          handleRepositoryClick
        }
        onIssueClick={
          handleIssueClick
        }
        onMeetingClick={
          handleMeetingClick
        }
      />
    </>
  );
};

/* ============================================================
   ROLE BADGE
============================================================ */

const RoleBadge = ({
  icon,

  label,
}: {
  icon: ReactNode;

  label: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      px: 1.25,

      py: 0.75,

      borderRadius: 2,

      border: "1px solid",

      borderColor:
        "divider",

      display: "flex",

      alignItems:
        "center",

      gap: 0.75,
    }}
  >
    {icon}

    <Typography
      variant="caption"
      fontWeight={700}
    >
      {label}
    </Typography>
  </Paper>
);

/* ============================================================
   SMALL METRIC
============================================================ */

interface SmallMetricProps {
  title: string;

  value: number;

  icon: ReactNode;

  onClick?: () => void;
}

const SmallMetric = ({
  title,

  value,

  icon,

  onClick,
}: SmallMetricProps) => {
  const clickable =
    Boolean(onClick);

  return (
    <Paper
      component={
        clickable
          ? "button"
          : "div"
      }
      type={
        clickable
          ? "button"
          : undefined
      }
      onClick={onClick}
      elevation={0}
      sx={{
        p: 2,

        minHeight: 105,

        width: "100%",

        borderRadius: 3,

        border: "1px solid",

        borderColor:
          "divider",

        bgcolor:
          "background.paper",

        textAlign: "left",

        font: "inherit",

        color: "inherit",

        cursor: clickable
          ? "pointer"
          : "default",

        transition:
          "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",

        "&:hover":
          clickable
            ? {
                boxShadow: 3,

                transform:
                  "translateY(-2px)",

                borderColor:
                  "primary.main",
              }
            : undefined,

        "&:focus-visible":
          clickable
            ? {
                outline:
                  "2px solid",

                outlineColor:
                  "primary.main",

                outlineOffset: 2,
              }
            : undefined,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 0.75,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={700}
          >
            {value}
          </Typography>

          {clickable && (
            <Typography
              variant="caption"
              color="primary.main"
              fontWeight={700}
              sx={{
                display:
                  "block",

                mt: 0.5,
              }}
            >
              Click to view
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            width: 34,

            height: 34,

            borderRadius: 2,

            display: "grid",

            placeItems: "center",

            bgcolor:
              "action.hover",

            color:
              "primary.main",
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
};

/* ============================================================
   ROLE
============================================================ */

const getRoleLabel = (
  role?: string,
) => {
  switch (role) {
    case "ADMIN":
      return "Administrator";

    case "PROJECT_MANAGER":
      return "Project Manager";

    case "TEAM_MEMBER":
      return "Project Member";

    default:
      return "User";
  }
};

/* ============================================================
   ROLE MESSAGE
============================================================ */

const getRoleMessage = (
  role: string,
) => {
  switch (role) {
    case "Administrator":
      return "You can monitor all projects and project activity available to your account.";

    case "Project Manager":
      return "Here is an overview of the projects and work available to you as a project manager.";

    case "Project Member":
      return "Here is an overview of the projects you are a member of and their current work.";

    default:
      return "Here is what's happening with your accessible projects.";
  }
};

export default Dashboard;