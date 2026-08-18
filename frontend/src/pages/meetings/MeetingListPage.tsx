import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { Add, CalendarMonth, Refresh } from "@mui/icons-material";

import MeetingCard from "../../components/meeting/MeetingCard";

import meetingService from "../../services/meeting.service";
import projectService from "../../services/project.service";

import type { Meeting } from "../../types/meeting.types";
import type { Project } from "../../types/project.types";

// ============================================================
// USER ROLE
// ============================================================

type UserRole = "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER" | string;

// ============================================================
// GET CURRENT USER ROLE
// ============================================================

const getCurrentUserRole = (): UserRole | null => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    const user = JSON.parse(storedUser);

    return user?.role ?? null;
  } catch {
    return null;
  }
};

// ============================================================
// PAGE
// ============================================================

const MeetingListPage = () => {
  const { projectId } = useParams<{
    projectId?: string;
  }>();

  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // ==========================================================
  // PERMISSIONS
  // ==========================================================

  const canManageMeetings =
    userRole === "ADMIN" || userRole === "PROJECT_MANAGER";

  // ==========================================================
  // LOAD USER ROLE
  // ==========================================================

  useEffect(() => {
    setUserRole(getCurrentUserRole());
  }, []);

  // ==========================================================
  // LOAD MEETINGS
  // ==========================================================
  //
  // TWO MODES:
  //
  // 1. /meetings
  //    Load all projects available to the current user,
  //    then load meetings for each project.
  //
  // 2. /projects/:projectId/meetings
  //    Load meetings for that specific project only.
  //
  // ==========================================================

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // ========================================================
      // PROJECT MEETINGS
      // ========================================================

      if (projectId?.trim()) {
        const data = await meetingService.getMeetingsByProject(projectId);

        setMeetings(Array.isArray(data) ? data : []);

        return;
      }

      // ========================================================
      // GLOBAL MEETINGS
      // ========================================================
      //
      // There is currently no meetingService.getMeetings().
      //
      // Instead:
      //
      // 1. Get the user's projects.
      // 2. Get meetings for each project.
      // 3. Combine them into one list.
      //
      // ========================================================

      const projects = await projectService.getProjects();

      const validProjects = (Array.isArray(projects) ? projects : []).filter(
        (project: Project) => Boolean(project.id),
      );

      if (validProjects.length === 0) {
        setMeetings([]);
        return;
      }

      const results = await Promise.allSettled(
        validProjects.map(async (project: Project) => {
          if (!project.id) {
            return [];
          }

          return meetingService.getMeetingsByProject(project.id);
        }),
      );

      const allMeetings: Meeting[] = [];

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          if (Array.isArray(result.value)) {
            allMeetings.push(...result.value);
          }
        }
      });

      // ========================================================
      // REMOVE DUPLICATES
      // ========================================================

      const uniqueMeetings = Array.from(
        new Map(allMeetings.map((meeting) => [meeting.id, meeting])).values(),
      );

      // ========================================================
      // SORT BY START TIME
      // ========================================================

      uniqueMeetings.sort((a, b) => {
        const dateA = new Date(a.startTime).getTime();

        const dateB = new Date(b.startTime).getTime();

        return dateA - dateB;
      });

      setMeetings(uniqueMeetings);
    } catch (err: any) {
      console.error("Failed to load meetings:", err);

      setMeetings([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load meetings.",
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // ==========================================================
  // LOAD ON PAGE OPEN
  // ==========================================================

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // ==========================================================
  // CREATE MEETING
  // ==========================================================

  const handleCreateMeeting = () => {
    // ========================================================
    // PROJECT CREATE
    // ========================================================

    if (projectId?.trim()) {
      navigate(`/projects/${projectId}/meetings/create`);

      return;
    }

    // ========================================================
    // GLOBAL CREATE
    // ========================================================

    navigate("/meetings/create");
  };

  // ==========================================================
  // VIEW MEETING
  // ==========================================================

  const handleViewMeeting = (meeting: Meeting) => {
    if (!meeting?.id) {
      setError("Meeting ID is missing.");

      return;
    }

    navigate(`/meetings/${meeting.id}`);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">Loading meetings...</Typography>
        </Stack>
      </Box>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        {/* ====================================================
            HEADER
        ==================================================== */}

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
          sx={{
            mb: 4,
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                mb: 1,
              }}
            >
              <CalendarMonth
                color="primary"
                sx={{
                  fontSize: 32,
                }}
              />

              <Typography variant="h3" fontWeight={800}>
                Meetings
              </Typography>
            </Stack>

            <Typography color="text.secondary">
              {projectId
                ? "View, manage and join meetings for this project."
                : "View, manage and join your project meetings."}
            </Typography>
          </Box>

          {/* ==================================================
              CREATE MEETING
          ================================================== */}

          {canManageMeetings && (
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleCreateMeeting}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.3,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Create Meeting
            </Button>
          )}
        </Stack>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<Refresh />}
                onClick={loadMeetings}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {meetings.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              minHeight: 350,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 4,
            }}
          >
            <Stack alignItems="center" spacing={2} maxWidth={500}>
              <CalendarMonth
                sx={{
                  fontSize: 64,
                  color: "primary.main",
                  opacity: 0.7,
                }}
              />

              <Typography variant="h5" fontWeight={700}>
                No meetings yet
              </Typography>

              <Typography color="text.secondary">
                {projectId
                  ? canManageMeetings
                    ? "Create the first meeting for this project."
                    : "There are currently no meetings scheduled for this project."
                  : canManageMeetings
                    ? "Create your first meeting."
                    : "There are currently no meetings available."}
              </Typography>

              {canManageMeetings && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateMeeting}
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Create Meeting
                </Button>
              )}
            </Stack>
          </Paper>
        ) : (
          /* ==================================================
             MEETING CARDS
          ================================================== */

          <Grid container spacing={3}>
            {meetings.map((meeting) => (
              <Grid
                key={meeting.id}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4,
                }}
              >
                <MeetingCard meeting={meeting} onView={handleViewMeeting} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MeetingListPage;
