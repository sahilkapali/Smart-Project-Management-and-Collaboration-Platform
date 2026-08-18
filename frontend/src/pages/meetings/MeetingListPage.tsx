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

import type { Meeting } from "../../types/meeting.types";

const MeetingListPage = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD PROJECT MEETINGS
  // ============================================================

  const loadMeetings = useCallback(async () => {
    if (!projectId?.trim()) {
      setError("Project ID is missing. Please open meetings from a project.");

      setMeetings([]);
      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Loading meetings for project:", projectId);

      const response = await meetingService.getProjectMeetings(projectId);

      console.log("Meeting API response:", response);

      if (response?.success) {
        setMeetings(Array.isArray(response.data) ? response.data : []);
      } else {
        setMeetings([]);

        setError(response?.message || "Unable to load meetings.");
      }
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

  // ============================================================
  // LOAD WHEN PROJECT CHANGES
  // ============================================================

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // ============================================================
  // CREATE MEETING
  // ============================================================

  const handleCreateMeeting = () => {
    if (!projectId?.trim()) {
      setError("Project ID is missing.");

      return;
    }

    navigate(`/projects/${projectId}/meetings/create`);
  };

  // ============================================================
  // VIEW MEETING
  // ============================================================

  const handleViewMeeting = (meeting: Meeting) => {
    if (!meeting?._id) {
      setError("Meeting ID is missing.");

      return;
    }

    navigate(`/meetings/${meeting._id}`);
  };

  // ============================================================
  // NO PROJECT ID
  // ============================================================

  if (!projectId?.trim()) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          py: 5,
        }}
      >
        <Container maxWidth="lg">
          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
            }}
          >
            Project ID is missing. Please open the Meetings page from a project.
          </Alert>

          <Button
            variant="outlined"
            sx={{
              mt: 2,
              textTransform: "none",
            }}
            onClick={() => navigate("/projects")}
          >
            Back to Projects
          </Button>
        </Container>
      </Box>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 5,
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
          sx={{ mb: 4 }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
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
              View, manage and join meetings for this project.
            </Typography>
          </Box>

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
            LOADING
        ==================================================== */}

        {loading ? (
          <Paper
            elevation={0}
            sx={{
              minHeight: 350,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />

              <Typography color="text.secondary">
                Loading meetings...
              </Typography>
            </Stack>
          </Paper>
        ) : meetings.length === 0 ? (
          /* ==================================================
             EMPTY STATE
          ================================================== */

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
                Create the first meeting for this project.
              </Typography>

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
            </Stack>
          </Paper>
        ) : (
          /* ==================================================
             MEETING CARDS
          ================================================== */

          <Grid container spacing={3}>
            {meetings.map((meeting) => (
              <Grid
                key={meeting._id}
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
