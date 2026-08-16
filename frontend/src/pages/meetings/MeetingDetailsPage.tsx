import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

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

import MeetingNotes from "../../components/meeting/MeetingNotes";
import AISummaryCard from "../../components/meeting/AISummaryCard";
import ActionItemsCard from "../../components/meeting/ActionItemsCard";

import type { Meeting } from "../../types/meeting.types";

const MeetingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [meeting, setMeeting] =
    useState<Meeting | null>(null);

  const [loading, setLoading] = useState(true);

  const [summaryLoading, setSummaryLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  /**
   * Load meeting details
   */
  const loadMeeting = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await meetingService.getMeetingById(id);

      setMeeting(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to load meeting.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeeting();
  }, [id]);

  /**
   * Generate AI summary
   */
  const handleSummary = async () => {
    if (!id) return;

    try {
      setSummaryLoading(true);
      setError("");

      const noteId =
        meeting?.notes?.[
          meeting.notes.length - 1
        ]?._id;

      const response =
        await meetingService.summarizeMeeting(
          id,
          noteId,
        );

      setMeeting(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to generate summary.",
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  /**
   * Extract action items
   */
  const handleActionItems = async () => {
    if (!id) return;

    try {
      setActionLoading(true);
      setError("");

      const response =
        await meetingService.extractActionItems(
          id,
        );

      setMeeting(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to extract action items.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Meeting not found
   */
  if (!meeting) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">
          Meeting not found.
        </Alert>
      </Container>
    );
  }

  const start = new Date(
    meeting.startTime,
  );

  /**
   * Combine AI-generated summaries
   */
  const summary =
    meeting.notes
      ?.map(
        (note) =>
          note.aiGeneratedSummary,
      )
      .filter(Boolean)
      .join("\n\n") || "";

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 5 }}
    >
      <Stack spacing={4}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            alignSelf: "flex-start",
          }}
        >
          Back
        </Button>

        {/* Error Message */}
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/* Meeting Title and Description */}
        <Box>
          <Typography
            variant="h3"
            fontWeight={800}
          >
            {meeting.title}
          </Typography>

          {meeting.description && (
            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {meeting.description}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Meeting Information */}
        <Stack spacing={1}>
          <Typography>
            <strong>Date:</strong>{" "}
            {start.toLocaleDateString()}
          </Typography>

          <Typography>
            <strong>Time:</strong>{" "}
            {start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>

          <Typography>
            <strong>Participants:</strong>{" "}
            {meeting.participants?.length || 0}
          </Typography>
        </Stack>

        {/* Join Meeting */}
        {meeting.meetingLink && (
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            component="a"
            href={meeting.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              alignSelf: "flex-start",
            }}
          >
            Join Meeting
          </Button>
        )}

        {/* Meeting Notes */}
        <MeetingNotes
          meetingId={meeting._id}
          notes={meeting.notes}
        />

        {/* AI Summary */}
        <AISummaryCard
          summary={summary}
          onGenerate={handleSummary}
          loading={summaryLoading}
        />

        {/* Action Items */}
        <ActionItemsCard
          actionItems={meeting.actionItems}
          onGenerate={handleActionItems}
          loading={actionLoading}
        />
      </Stack>
    </Container>
  );
};

export default MeetingDetailsPage;