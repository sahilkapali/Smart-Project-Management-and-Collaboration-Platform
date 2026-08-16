import { useEffect, useState } from "react";
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

import type { Meeting } from "../../types/meeting.types";

const MeetingListPage = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<Meeting[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadMeetings = async () => {
    if (!projectId) {
      setError("Project ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await meetingService.getProjectMeetings(
          projectId
        );

      if (response.success) {
        setMeetings(response.data ?? []);
      } else {
        setError(
          response.message ||
            "Unable to load meetings."
        );
      }
    } catch (err: any) {
      console.error(
        "Failed to load meetings:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load meetings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [projectId]);

  const handleCreateMeeting = () => {
    if (!projectId) {
      setError("Project ID is missing.");
      return;
    }

    navigate(
      `/projects/${projectId}/meetings/create`
    );
  };

  const handleViewMeeting = (meeting: Meeting) => {
    navigate(`/meetings/${meeting._id}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 5,
      }}
    >
      <Container maxWidth="xl">
        {/* Page Header */}
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
                sx={{ fontSize: 32 }}
              />

              <Typography
                variant="h3"
                fontWeight={800}
              >
                Meetings
              </Typography>
            </Stack>

            <Typography
              variant="body1"
              color="text.secondary"
            >
              View and manage your project
              meetings.
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

        {/* Error */}
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

        {/* Loading */}
        {loading ? (
          <Paper
            elevation={0}
            sx={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
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
          /* Empty state */
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
                Schedule your first meeting for
                this project and invite your team
                members.
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
                Create Your First Meeting
              </Button>
            </Stack>
          </Paper>
        ) : (
          /* Meeting cards */
          <Grid
            container
            spacing={3}
          >
            {meetings.map((meeting) => (
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
                  onView={handleViewMeeting}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MeetingListPage;