import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  CalendarMonth,
  OpenInNew,
  People,
  Refresh,
} from "@mui/icons-material";

import meetingService from "../../services/meeting.service";
import aiService from "../../services/ai.service";

import MeetingNotes from "../../components/meeting/MeetingNotes";
import AISummaryCard from "../../components/meeting/AISummaryCard";
import ActionItemsCard from "../../components/meeting/ActionItemsCard";

import type { Meeting } from "../../types/meeting.types";

const MeetingDetailsPage = () => {
  const params = useParams<{
    id?: string;
    meetingId?: string;
  }>();

  /*
   * Support both names just in case another route
   * uses :meetingId.
   */
  const meetingId = params.id ?? params.meetingId;

  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<Meeting | null>(null);

  const [loading, setLoading] = useState(true);

  const [summaryLoading, setSummaryLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD MEETING
  // ============================================================

  const loadMeeting = useCallback(async () => {
    if (!meetingId || meetingId === "undefined" || meetingId === "null") {
      setError("Meeting ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Loading meeting:", meetingId);

      const response = await meetingService.getMeetingById(meetingId);

      if (!response?.data) {
        setError(response?.message || "Meeting not found.");

        setMeeting(null);
        return;
      }

      setMeeting(response.data);
    } catch (err: any) {
      console.error("Failed to load meeting:", err);

      setMeeting(null);

      setError(err?.response?.data?.message || "Unable to load meeting.");
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  // ============================================================
  // LOAD ON PAGE OPEN
  // ============================================================

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  // ============================================================
  // GENERATE SUMMARY
  // ============================================================

  const handleSummary = async () => {
    if (!meetingId) {
      setError("Meeting ID is missing.");
      return;
    }

    try {
      setSummaryLoading(true);
      setError("");

      await aiService.summarizeMeeting(meetingId);

      await loadMeeting();
    } catch (err: any) {
      console.error("AI summary failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to generate AI meeting summary.",
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  // ============================================================
  // GENERATE ACTION ITEMS
  // ============================================================

  const handleActionItems = async () => {
    if (!meetingId) {
      setError("Meeting ID is missing.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await aiService.extractActionItems(meetingId);

      await loadMeeting();
    } catch (err: any) {
      console.error("AI action items failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to extract action items.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">Loading meeting...</Typography>
        </Stack>
      </Box>
    );
  }

  // ============================================================
  // INVALID ID / NOT FOUND
  // ============================================================

  if (!meeting) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack spacing={2}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<Refresh />}
                onClick={loadMeeting}
              >
                Retry
              </Button>
            }
          >
            {error || "Meeting not found."}
          </Alert>

          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
            }}
          >
            Back
          </Button>
        </Stack>
      </Container>
    );
  }

  // ============================================================
  // DATE / TIME
  // ============================================================

  const start = new Date(meeting.startTime);

  const end = meeting.endTime ? new Date(meeting.endTime) : null;

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary =
    meeting.notes
      ?.map((note) => note.aiGeneratedSummary)
      .filter((value): value is string => Boolean(value))
      .join("\n\n") || "";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack spacing={4}>
        {/* =====================================================
            BACK
        ===================================================== */}

        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{
            alignSelf: "flex-start",
            textTransform: "none",
          }}
        >
          Back
        </Button>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* =====================================================
            HEADER
        ===================================================== */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 3,
              md: 4,
            },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h3" fontWeight={800}>
              {meeting.title}
            </Typography>

            {meeting.description && (
              <Typography color="text.secondary" variant="body1">
                {meeting.description}
              </Typography>
            )}

            <Divider />

            {/* =================================================
                DATE
            ================================================= */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={{
                xs: 2,
                sm: 4,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonth color="primary" />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date
                  </Typography>

                  <Typography fontWeight={600}>
                    {start.toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </Stack>

              {/* =================================================
                  TIME
              ================================================= */}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Time
                </Typography>

                <Typography fontWeight={600}>
                  {start.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}

                  {end &&
                    ` – ${end.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </Typography>
              </Box>

              {/* =================================================
                  PARTICIPANTS
              ================================================= */}

              <Stack direction="row" spacing={1} alignItems="center">
                <People color="primary" />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Participants
                  </Typography>

                  <Typography fontWeight={600}>
                    {meeting.participants?.length ?? 0}
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            {/* =================================================
                JOIN
            ================================================= */}

            {meeting.meetingLink && (
              <Button
                variant="contained"
                startIcon={<OpenInNew />}
                component="a"
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  alignSelf: "flex-start",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Join Meeting
              </Button>
            )}
          </Stack>
        </Paper>

        {/* =====================================================
            NOTES
        ===================================================== */}

        <MeetingNotes meetingId={meeting._id} notes={meeting.notes ?? []} />

        {/* =====================================================
            AI SUMMARY
        ===================================================== */}

        <AISummaryCard
          summary={summary}
          onGenerate={handleSummary}
          loading={summaryLoading}
        />

        {/* =====================================================
            ACTION ITEMS
        ===================================================== */}

        <ActionItemsCard
          actionItems={meeting.actionItems ?? []}
          onGenerate={handleActionItems}
          loading={actionLoading}
        />
      </Stack>
    </Container>
  );
};

export default MeetingDetailsPage;
