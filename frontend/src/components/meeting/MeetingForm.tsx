import { useState } from "react";

import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
} from "@mui/material";

import ParticipantSelector from "./ParticipantSelector";

import type {
  CreateMeetingData,
  UserReference,
} from "../../types/meeting.types";

interface MeetingFormProps {
  users: UserReference[];
  projectId: string;
  onSubmit: (data: CreateMeetingData) => Promise<void>;
  loading?: boolean;
}

const MeetingForm = ({
  users,
  projectId,
  onSubmit,
  loading = false,
}: MeetingFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Meeting title is required.");
      return;
    }

    if (!startTime || !endTime) {
      setError("Start and end time are required.");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError(
        "End time must be later than start time.",
      );
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        meetingLink: meetingLink.trim(),
        projectId,
        participants,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to create meeting.",
      );
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: "100%" }}
    >
      <Stack spacing={3}>
        <Typography
          variant="h5"
          fontWeight={700}
        >
          Schedule Meeting
        </Typography>

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        <TextField
          label="Meeting Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
          fullWidth
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          multiline
          minRows={3}
          fullWidth
        />

        <TextField
          label="Meeting Link"
          value={meetingLink}
          onChange={(e) =>
            setMeetingLink(e.target.value)
          }
          placeholder="https://meet.google.com/..."
          fullWidth
        />

        <ParticipantSelector
           users={users}
           selectedParticipants={users.filter((user) =>
           participants.includes(user._id)
      )}
      onChange={(selectedUsers) => {
    setParticipants(selectedUsers.map((user) => user._id));
  }}
/>

        <TextField
          label="Start Time"
          type="datetime-local"
          value={startTime}
          onChange={(e) =>
            setStartTime(e.target.value)
          }
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          required
        />

        <TextField
          label="End Time"
          type="datetime-local"
          value={endTime}
          onChange={(e) =>
            setEndTime(e.target.value)
          }
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          required
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Schedule Meeting"}
        </Button>
      </Stack>
    </Box>
  );
};

export default MeetingForm;