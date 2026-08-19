import { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

import NotesIcon from "@mui/icons-material/Notes";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import type { Meeting, MeetingNote } from "../../types/meeting.types";
import meetingService from "../../services/meeting.service";

interface MeetingNotesProps {
  meetingId: string;
  notes?: MeetingNote[];
  onMeetingUpdated?: (meeting: Meeting) => void;
}

const MeetingNotes = ({
  meetingId,
  notes = [],
  onMeetingUpdated,
}: MeetingNotesProps) => {
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [summarizingNoteId, setSummarizingNoteId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState("");

  /* =====================================================
     ADD NOTE HANDLER
  ===================================================== */
  const handleAddNote = async () => {
    if (!meetingId) {
      setMessage("Meeting ID is missing.");
      return;
    }

    if (!newNote.trim()) {
      setMessage("Please enter a meeting note.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const updatedMeeting = await meetingService.addMeetingNote(
        meetingId,
        newNote.trim(),
      );

      setNewNote("");
      setMessage("Meeting note added successfully.");

      if (onMeetingUpdated) {
        onMeetingUpdated(updatedMeeting);
      } else {
        window.location.reload(); // Fallback
      }
    } catch (error: any) {
      console.error("Failed to add meeting note:", error);
      setMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to add meeting note.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     AI SUMMARIZE HANDLER
  ===================================================== */
  const handleSummarizeNote = async (noteId: string) => {
    if (!meetingId || !noteId) return;

    try {
      setSummarizingNoteId(noteId);
      setMessage("");

      const updatedMeeting = await meetingService.summarizeMeetingNote(
        meetingId,
        noteId,
      );

      setMessage("AI summary generated successfully.");

      if (onMeetingUpdated) {
        onMeetingUpdated(updatedMeeting);
      } else {
        window.location.reload(); // Fallback
      }
    } catch (error: any) {
      console.error("Failed to summarize note:", error);
      setMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to generate AI summary.",
      );
    } finally {
      setSummarizingNoteId(null);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* =====================================================
            HEADER
        ===================================================== */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <NotesIcon color="primary" />
          Meeting Notes
        </Typography>

        {/* =====================================================
            ADD NOTE
        ===================================================== */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Meeting Note"
            placeholder="Enter your meeting notes here..."
            value={newNote}
            onChange={(event) => {
              setNewNote(event.target.value);
              if (message) setMessage("");
            }}
            disabled={loading || summarizingNoteId !== null}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNote}
            disabled={loading || !meetingId || summarizingNoteId !== null}
            sx={{
              mt: 2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {loading ? "Adding..." : "Add Meeting Note"}
          </Button>

          {message && (
            <Alert
              severity={message.includes("successfully") ? "success" : "error"}
              sx={{ mt: 2 }}
              onClose={() => setMessage("")}
            >
              {message}
            </Alert>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* =====================================================
            EXISTING NOTES
        ===================================================== */}
        {notes.length === 0 ? (
          <Typography color="text.secondary">
            No notes have been added yet.
          </Typography>
        ) : (
          <Box>
            {notes.map((note, index) => {
              const noteId = note._id || note.id;
              const isSummarizing = summarizingNoteId === noteId;

              return (
                <Box key={noteId || `meeting-note-${index}`}>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {note.content}
                  </Typography>

                  {/* AI Summary Section */}
                  {note.aiGeneratedSummary && (
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        borderLeft: "4px solid",
                        borderColor: "secondary.main",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        <strong>✨ AI Summary:</strong>{" "}
                        {note.aiGeneratedSummary}
                      </Typography>
                    </Box>
                  )}

                  {/* AI Actions */}
                  <Box sx={{ mt: 1.5 }}>
                    <Button
                      size="small"
                      color="secondary"
                      variant="outlined"
                      onClick={() => noteId && handleSummarizeNote(noteId)}
                      disabled={isSummarizing || !noteId}
                      startIcon={
                        isSummarizing ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <AutoAwesomeIcon />
                        )
                      }
                      sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                      {isSummarizing
                        ? "Summarizing..."
                        : note.aiGeneratedSummary
                          ? "Regenerate Summary"
                          : "Summarize with AI"}
                    </Button>
                  </Box>

                  {index < notes.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingNotes;
