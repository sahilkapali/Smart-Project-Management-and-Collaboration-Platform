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
} from "@mui/material";

import NotesIcon from "@mui/icons-material/Notes";
import AddIcon from "@mui/icons-material/Add";

import type { MeetingNote } from "../../types/meeting.types";
import meetingService from "../../services/meeting.service";

interface MeetingNotesProps {
  meetingId: string;
  notes?: MeetingNote[];
}

const MeetingNotes = ({
  meetingId,
  notes = [],
}: MeetingNotesProps) => {
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      setMessage("Please enter a meeting note.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await meetingService.addMeetingNotes(
        meetingId,
        newNote.trim(),
      );

      setNewNote("");
      setMessage("Meeting note added successfully.");

      // Refresh the page so the newly added note appears
      window.location.reload();
    } catch (error: any) {
      console.error(
        "Failed to add meeting note:",
        error,
      );

      setMessage(
        error?.response?.data?.message ||
          "Failed to add meeting note.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent>
        {/* Header */}
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

        {/* Add Meeting Note */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Meeting Note"
            placeholder="Enter your meeting notes here..."
            value={newNote}
            onChange={(e) =>
              setNewNote(e.target.value)
            }
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNote}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading
              ? "Adding..."
              : "Add Meeting Note"}
          </Button>

          {message && (
            <Alert
              severity={
                message.includes("successfully")
                  ? "success"
                  : "error"
              }
              sx={{ mt: 2 }}
            >
              {message}
            </Alert>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Existing Notes */}
        {notes.length === 0 ? (
          <Typography color="text.secondary">
            No notes have been added yet.
          </Typography>
        ) : (
          <Box>
            {notes.map((note, index) => (
              <Box key={note._id || index}>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {note.content}
                </Typography>

                {note.aiGeneratedSummary && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    <strong>
                      AI Summary:
                    </strong>{" "}
                    {note.aiGeneratedSummary}
                  </Typography>
                )}

                {index < notes.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingNotes;