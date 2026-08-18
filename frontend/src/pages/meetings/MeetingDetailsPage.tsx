import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Container,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Box,
  Divider,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import meetingService from "../../services/meeting.service";
import aiService from "../../services/ai.service";

import MeetingNotes from "../../components/meeting/MeetingNotes";
import AISummaryCard from "../../components/meeting/AISummaryCard";
import ActionItemsCard from "../../components/meeting/ActionItemsCard";

import type { Meeting } from "../../types/meeting.types";

const MeetingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD MEETING DETAILS
  // ============================================================

  const loadMeeting = async () => {
    if (!id) {
      setError("Meeting ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await meetingService.getMeetingById(id);

      setMeeting(response.data);
    } catch (err: any) {
      console.error("Failed to load meeting:", err);

      setError(err?.response?.data?.message || "Unable to load meeting.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD MEETING WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    loadMeeting();
  }, [id]);

  // ============================================================
  // GENERATE AI MEETING SUMMARY
  // ============================================================

  const handleSummary = async () => {
    console.log("=== AI SUMMARY BUTTON CLICKED ===");

    if (!id) {
      setError("Meeting ID is missing.");
      return;
    }

    try {
      setSummaryLoading(true);
      setError("");

      console.log("Meeting ID:", id);
      console.log("Meeting notes:", meeting?.notes);

      const noteId = meeting?.notes?.[meeting.notes.length - 1]?._id;

      console.log("Note ID:", noteId);

      if (!noteId) {
        setError("No meeting note is available to summarize.");
        return;
      }

      console.log("Calling PATCH /meetings/" + id + "/ai-summary");

      // FIXED: Removed the secondary noteId argument to match the service signature
      await aiService.summarizeMeeting(id);

      console.log("AI summary request completed.");

      // Reload the complete meeting from backend
      await loadMeeting();

      console.log("Meeting reloaded successfully.");
    } catch (err: any) {
      console.error("AI meeting summary failed:", err);
      console.error("Response:", err?.response?.data);

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
  // GENERATE AI ACTION ITEMS
  // ============================================================

  const handleActionItems = async () => {
    if (!id) {
      setError("Meeting ID is missing.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      /*
       * Call the backend AI action-item endpoint.
       */
      await aiService.extractActionItems(id);

      /*
       * The AI endpoint returns MeetingAIData,
       * not a complete Meeting.
       *
       * Therefore reload the meeting after
       * the AI operation has completed.
       */
      await loadMeeting();
    } catch (err: any) {
      console.error("AI action-item extraction failed:", err);

      setError(
        err?.response?.data?.message || "Failed to extract AI action items.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ============================================================
  // MEETING NOT FOUND
  // ============================================================

  if (!meeting) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">{error || "Meeting not found."}</Alert>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </Container>
    );
  }

  // ============================================================
  // MEETING DATE/TIME
  // ============================================================

  const start = new Date(meeting.startTime);

  // ============================================================
  // AI SUMMARY
  // ============================================================

  /*
   * Meeting notes may contain AI-generated summaries.
   *
   * Combine all available summaries into one string
   * for AISummaryCard.
   */
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
        {/* ================================================== */}
        {/* BACK BUTTON */}
        {/* ================================================== */}

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ alignSelf: "flex-start" }}
        >
          Back
        </Button>

        {/* ================================================== */}
        {/* ERROR MESSAGE */}
        {/* ================================================== */}

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* ================================================== */}
        {/* MEETING TITLE */}
        {/* ================================================== */}

        <Box>
          <Typography variant="h3" fontWeight={800}>
            {meeting.title}
          </Typography>

          {meeting.description && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {meeting.description}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* ================================================== */}
        {/* MEETING INFORMATION */}
        {/* ================================================== */}

        <Stack spacing={1}>
          <Typography>
            <strong>Date:</strong> {start.toLocaleDateString()}
          </Typography>

          <Typography>
            <strong>Time:</strong>{" "}
            {start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>

          <Typography>
            <strong>Participants:</strong> {meeting.participants?.length || 0}
          </Typography>
        </Stack>

        {/* ================================================== */}
        {/* JOIN MEETING */}
        {/* ================================================== */}

        {meeting.meetingLink && (
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            component="a"
            href={meeting.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ alignSelf: "flex-start" }}
          >
            Join Meeting
          </Button>
        )}

        {/* ================================================== */}
        {/* MEETING NOTES */}
        {/* ================================================== */}

        <MeetingNotes meetingId={meeting._id} notes={meeting.notes} />

        {/* ================================================== */}
        {/* AI MEETING SUMMARY */}
        {/* ================================================== */}

        <AISummaryCard
          summary={summary}
          onGenerate={handleSummary}
          loading={summaryLoading}
        />

        {/* ================================================== */}
        {/* AI ACTION ITEMS */}
        {/* ================================================== */}

        <ActionItemsCard
          actionItems={meeting.actionItems || []}
          onGenerate={handleActionItems}
          loading={actionLoading}
        />
      </Stack>
    </Container>
  );
};

export default MeetingDetailsPage;
