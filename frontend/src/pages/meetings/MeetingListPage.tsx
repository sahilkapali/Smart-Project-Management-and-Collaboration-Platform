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

import {
  Add,
  CalendarMonth,
  Refresh,
} from "@mui/icons-material";

import MeetingCard from "../../components/meeting/MeetingCard";
import meetingService from "../../services/meeting.service";
import projectService from "../../services/project.service";

import type { Meeting } from "../../types/meeting.types";
import type { Project } from "../../types/project.types";

const MeetingListPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // PROJECT ID HELPER
  // ============================================================

  const getProjectId = (
    project: Project,
  ): string | undefined => {
    return (
      project.id ||
      (project as Project & { _id?: string })._id
    );
  };

  // ============================================================
  // LOAD PROJECTS
  // ============================================================

  const loadProjects = useCallback(async () => {
    try {
      const response: any =
        await projectService.getProjects();

      const projectsData = Array.isArray(response)
        ? response
        : response?.projects ||
          response?.data ||
          [];

      const safeProjects = Array.isArray(projectsData)
        ? projectsData
        : [];

      setProjects(safeProjects);

      return safeProjects;
    } catch (err: any) {
      console.error(
        "Failed to load projects:",
        err,
      );

      throw err;
    }
  }, []);

  // ============================================================
  // LOAD MEETINGS
  // ============================================================

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * ========================================================
       * PROJECT-SPECIFIC MEETINGS
       * ========================================================
       *
       * Normal route:
       *
       * /projects/:projectId/meetings
       *
       * In this case the project ID already comes from
       * useParams().
       */

      if (projectId) {
        const response =
          await meetingService.getProjectMeetings(
            projectId,
          );

        if (!response.success) {
          setMeetings([]);

          setError(
            response.message ||
              "Unable to load meetings.",
          );

          return;
        }

        setMeetings(response.data ?? []);

        return;
      }

      /*
       * ========================================================
       * NO PROJECT ID
       * ========================================================
       *
       * If this page is ever opened without a projectId,
       * retrieve projects first and collect their meetings.
       */

      const safeProjects = await loadProjects();

      if (safeProjects.length === 0) {
        setMeetings([]);
        return;
      }

      const projectIds = safeProjects
        .map((project) =>
          getProjectId(project),
        )
        .filter(
          (id): id is string =>
            Boolean(id),
        );

      if (projectIds.length === 0) {
        setMeetings([]);
        setError(
          "No valid project IDs were found.",
        );
        return;
      }

      /*
       * ========================================================
       * LOAD MEETINGS FOR ALL PROJECTS
       * ========================================================
       */

      const responses =
        await Promise.all(
          projectIds.map((id) =>
            meetingService.getProjectMeetings(
              id,
            ),
          ),
        );

      const allMeetings =
        responses.flatMap((response) =>
          response.success
            ? response.data ?? []
            : [],
        );

      /*
       * ========================================================
       * REMOVE DUPLICATES
       * ========================================================
       */

      const uniqueMeetings = Array.from(
        new Map(
          allMeetings.map((meeting) => [
            meeting._id,
            meeting,
          ]),
        ).values(),
      );

      /*
       * ========================================================
       * SORT MEETINGS
       * ========================================================
       */

      uniqueMeetings.sort(
        (a, b) =>
          new Date(
            b.startTime,
          ).getTime() -
          new Date(
            a.startTime,
          ).getTime(),
      );

      setMeetings(uniqueMeetings);
    } catch (err: any) {
      console.error(
        "Failed to load meetings:",
        err,
      );

      setMeetings([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load meetings.",
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, loadProjects]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  // ============================================================
  // CREATE MEETING
  // ============================================================

  const handleCreateMeeting = () => {
    /*
     * If we're already inside a project,
     * use that project's ID.
     */

    if (projectId) {
      navigate(
        `/projects/${projectId}/meetings/create`,
      );

      return;
    }

    /*
     * If there is no projectId,
     * use the first available project.
     */

    const firstProject = projects[0];

    if (!firstProject) {
      setError(
        "You need to create a project before creating a meeting.",
      );

      return;
    }

    const firstProjectId =
      getProjectId(firstProject);

    if (!firstProjectId) {
      setError(
        "Project ID is missing.",
      );

      return;
    }

    navigate(
      `/projects/${firstProjectId}/meetings/create`,
    );
  };

  // ============================================================
  // VIEW MEETING
  // ============================================================

  const handleViewMeeting = (
    meeting: Meeting,
  ) => {
    if (!meeting?._id) {
      setError(
        "Meeting ID is missing.",
      );

      return;
    }

    navigate(
      `/meetings/${meeting._id}`,
    );
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        bgcolor: "background.default",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        {/* ==================================================== */}
        {/* HEADER                                               */}
        {/* ==================================================== */}

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
            mb: 3,
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                mb: 0.5,
              }}
            >
              <CalendarMonth
                color="primary"
                sx={{
                  fontSize: {
                    xs: 28,
                    sm: 32,
                  },
                }}
              />

              <Typography
                sx={{
                  fontSize: {
                    xs: "1.8rem",
                    sm: "2.2rem",
                    md: "2.4rem",
                  },
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Meetings
              </Typography>
            </Stack>

            <Typography
              color="text.secondary"
            >
              View and manage your project
              meetings
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateMeeting}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
              py: 1.1,
            }}
          >
            Create Meeting
          </Button>
        </Stack>

        {/* ==================================================== */}
        {/* ERROR                                                */}
        {/* ==================================================== */}

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
                onClick={() => {
                  void loadMeetings();
                }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* ==================================================== */}
        {/* LOADING                                              */}
        {/* ==================================================== */}

        {loading ? (
          <Paper
            elevation={0}
            sx={{
              minHeight: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack
              alignItems="center"
              spacing={2}
            >
              <CircularProgress />

              <Typography
                color="text.secondary"
              >
                Loading meetings...
              </Typography>
            </Stack>
          </Paper>
        ) : meetings.length === 0 ? (
          /* ================================================== */
          /* EMPTY STATE                                        */
          /* ================================================== */

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
              bgcolor: "background.paper",
              p: 4,
            }}
          >
            <Stack
              alignItems="center"
              spacing={2}
              maxWidth={500}
            >
              <CalendarMonth
                sx={{
                  fontSize: 64,
                  color: "primary.main",
                  opacity: 0.7,
                }}
              />

              <Typography
                variant="h5"
                fontWeight={700}
              >
                No meetings yet
              </Typography>

              <Typography
                color="text.secondary"
              >
                Schedule your first meeting
                for this project and invite
                your team members.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={
                  handleCreateMeeting
                }
                disabled={
                  !projectId &&
                  projects.length === 0
                }
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Create Your First Meeting
              </Button>
            </Stack>
          </Paper>
        ) : (
          /* ================================================== */
          /* MEETING CARDS                                      */
          /* ================================================== */

          <Grid
            container
            spacing={2.5}
          >
            {meetings.map(
              (meeting) => (
                <Grid
                  key={meeting._id}
                  size={{
                    xs: 12,
                    sm: 6,
                    lg: 4,
                  }}
                >
                  <MeetingCard
                    meeting={meeting}
                    onView={
                      handleViewMeeting
                    }
                  />
                </Grid>
              ),
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MeetingListPage;