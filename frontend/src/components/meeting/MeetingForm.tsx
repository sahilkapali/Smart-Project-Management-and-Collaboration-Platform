import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ParticipantSelector from "./ParticipantSelector";

import type {
  CreateMeetingPayload,
  MeetingProject,
  MeetingUser,
} from "../../types/meeting.types";

interface MeetingFormProps {
  users: MeetingUser[];
  projects: MeetingProject[];
  projectId: string;
  onSubmit: (data: CreateMeetingPayload) => Promise<void>;
  loading?: boolean;
}

const MeetingForm = ({
  users,
  projects,
  projectId,
  onSubmit,
  loading = false,
}: MeetingFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const [participants, setParticipants] = useState<string[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState(projectId);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [error, setError] = useState("");

  // ============================================================
  // SYNC PROJECT ID
  // ============================================================

  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId]);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    // ----------------------------------------------------------
    // TITLE
    // ----------------------------------------------------------

    if (!title.trim()) {
      setError("Meeting title is required.");
      return;
    }

    // ----------------------------------------------------------
    // PROJECT
    // ----------------------------------------------------------

    if (!selectedProjectId.trim()) {
      setError("Please select a project.");
      return;
    }

    // ----------------------------------------------------------
    // START / END TIME
    // ----------------------------------------------------------

    if (!startTime || !endTime) {
      setError("Start and end time are required.");
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError("Please enter valid start and end times.");
      return;
    }

    if (startDate >= endDate) {
      setError("End time must be later than start time.");
      return;
    }

    // ----------------------------------------------------------
    // CREATE PAYLOAD
    // ----------------------------------------------------------

    const meetingData: CreateMeetingPayload = {
      title: title.trim(),

      description: description.trim() || undefined,

      meetingLink: meetingLink.trim() || undefined,

      projectId: selectedProjectId,

      participants,

      startTime: startDate.toISOString(),

      endTime: endDate.toISOString(),
    };

    // ----------------------------------------------------------
    // SEND TO PARENT
    // ----------------------------------------------------------

    try {
      await onSubmit(meetingData);
    } catch (err: any) {
      console.error("Meeting form submission failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to create meeting.",
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: "100%",
      }}
    >
      <Stack spacing={3}>
        {/* ======================================================
            TITLE
        ====================================================== */}

        <Typography variant="h5" fontWeight={700}>
          Create Meeting
        </Typography>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* ======================================================
            MEETING TITLE
        ====================================================== */}

        <TextField
          label="Meeting Title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          required
          fullWidth
          disabled={loading}
        />

        {/* ======================================================
            PROJECT
        ====================================================== */}

        <TextField
          label="Project"
          value={selectedProjectId}
          onChange={(event) => {
            setSelectedProjectId(event.target.value);
          }}
          select
          required
          fullWidth
          disabled={loading}
        >
          {projects.length === 0 ? (
            <MenuItem value="" disabled>
              No projects available
            </MenuItem>
          ) : (
            projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name || project.id}
              </MenuItem>
            ))
          )}
        </TextField>

        {/* ======================================================
            DESCRIPTION
        ====================================================== */}

        <TextField
          label="Description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          multiline
          minRows={3}
          fullWidth
          disabled={loading}
        />

        {/* ======================================================
            MEETING LINK
        ====================================================== */}

        <TextField
          label="Meeting Link"
          value={meetingLink}
          onChange={(event) => {
            setMeetingLink(event.target.value);
          }}
          placeholder="https://meet.google.com/..."
          fullWidth
          disabled={loading}
        />

        {/* ======================================================
            PARTICIPANTS
        ====================================================== */}

        <ParticipantSelector
          users={users}
          selectedParticipants={users.filter((user) =>
            participants.includes(user.id),
          )}
          onChange={(selectedUsers) => {
            setParticipants(selectedUsers.map((user) => user.id));
          }}
        />

        {/* ======================================================
            START TIME
        ====================================================== */}

        <TextField
          label="Start Time"
          type="datetime-local"
          value={startTime}
          onChange={(event) => {
            setStartTime(event.target.value);
          }}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          required
          disabled={loading}
        />

        {/* ======================================================
            END TIME
        ====================================================== */}

        <TextField
          label="End Time"
          type="datetime-local"
          value={endTime}
          onChange={(event) => {
            setEndTime(event.target.value);
          }}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          required
          disabled={loading}
        />

        {/* ======================================================
            SUBMIT
        ====================================================== */}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            py: 1.3,
          }}
        >
          {loading ? "Creating..." : "Create Meeting"}
        </Button>
      </Stack>
    </Box>
  );
};

export default MeetingForm;
