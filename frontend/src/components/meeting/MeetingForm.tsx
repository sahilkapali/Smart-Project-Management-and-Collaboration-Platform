import { useEffect, useState } from "react";

import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
  MenuItem,
} from "@mui/material";

import ParticipantSelector from "./ParticipantSelector";

import type {
  CreateMeetingData,
  UserReference,
  ProjectReference,
} from "../../types/meeting.types";

interface MeetingFormProps {
  users: UserReference[];

  projects: ProjectReference[];

  projectId: string;

  onSubmit: (
    data: CreateMeetingData,
  ) => Promise<void>;

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
  const [description, setDescription] =
    useState("");
  const [meetingLink, setMeetingLink] =
    useState("");

  const [participants, setParticipants] =
    useState<string[]>([]);

  /*
   * Selected project.
   *
   * Initially this is the projectId from
   * the URL.
   */
  const [selectedProjectId, setSelectedProjectId] =
    useState(projectId);

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * If the projectId from the URL changes,
   * update the initially selected project.
   */
  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId]);

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError("");

    /*
     * Validate title
     */
    if (!title.trim()) {
      setError(
        "Meeting title is required.",
      );
      return;
    }

    /*
     * Validate project
     */
    if (!selectedProjectId) {
      setError(
        "Please select a project.",
      );
      return;
    }

    /*
     * Validate time
     */
    if (!startTime || !endTime) {
      setError(
        "Start and end time are required.",
      );
      return;
    }

    /*
     * Make sure end time is after start time
     */
    if (
      new Date(startTime) >=
      new Date(endTime)
    ) {
      setError(
        "End time must be later than start time.",
      );
      return;
    }

    try {
      const meetingData: CreateMeetingData = {
        title: title.trim(),

        description:
          description.trim() || undefined,

        meetingLink:
          meetingLink.trim() || undefined,

        /*
         * IMPORTANT:
         * This is the project selected
         * from the dropdown.
         */
        projectId: selectedProjectId,

        participants,

        startTime:
          new Date(
            startTime,
          ).toISOString(),

        endTime:
          new Date(
            endTime,
          ).toISOString(),
      };

      await onSubmit(meetingData);
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
      sx={{
        width: "100%",
      }}
    >
      <Stack spacing={3}>
        {/* Page title */}
        <Typography
          variant="h5"
          fontWeight={700}
        >
          Create Meeting
        </Typography>

        {/* Error */}
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/* Meeting Title */}
        <TextField
          label="Meeting Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
          fullWidth
        />

        {/* Project */}
        <TextField
          label="Project"
          value={selectedProjectId}
          onChange={(e) =>
            setSelectedProjectId(
              e.target.value,
            )
          }
          select
          required
          fullWidth
        >
          {projects.length === 0 ? (
            <MenuItem
              value=""
              disabled
            >
              No projects available
            </MenuItem>
          ) : (
            projects.map((project) => (
              <MenuItem
                key={project._id}
                value={project._id}
              >
                {project.name}
              </MenuItem>
            ))
          )}
        </TextField>

        {/* Description */}
        <TextField
          label="Description"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value,
            )
          }
          multiline
          minRows={3}
          fullWidth
        />

        {/* Meeting Link */}
        <TextField
          label="Meeting Link"
          value={meetingLink}
          onChange={(e) =>
            setMeetingLink(
              e.target.value,
            )
          }
          placeholder="https://meet.google.com/..."
          fullWidth
        />

        {/* Participants */}
        <ParticipantSelector
          users={users}
          selectedParticipants={users.filter(
            (user) =>
              participants.includes(
                user._id,
              ),
          )}
          onChange={(selectedUsers) => {
            setParticipants(
              selectedUsers.map(
                (user) => user._id,
              ),
            );
          }}
        />

        {/* Start Time */}
        <TextField
          label="Start Time"
          type="datetime-local"
          value={startTime}
          onChange={(e) =>
            setStartTime(
              e.target.value,
            )
          }
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          required
        />

        {/* End Time */}
        <TextField
          label="End Time"
          type="datetime-local"
          value={endTime}
          onChange={(e) =>
            setEndTime(
              e.target.value,
            )
          }
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          required
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Meeting"}
        </Button>
      </Stack>
    </Box>
  );
};

export default MeetingForm;