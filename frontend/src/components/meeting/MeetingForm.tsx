import {
  useEffect,
  useState,
} from "react";

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
  // ============================================================
  // FORM STATE
  // ============================================================

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [meetingLink, setMeetingLink] =
    useState("");

  const [participants, setParticipants] =
    useState<string[]>([]);

  const [selectedProjectId, setSelectedProjectId] =
    useState(projectId || "");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [error, setError] =
    useState("");

  // ============================================================
  // INITIAL PROJECT
  // ============================================================

  useEffect(() => {
    /*
     * If the page was opened from:
     *
     * /projects/:projectId/meetings/create
     *
     * automatically select that project.
     */

    if (projectId) {
      setSelectedProjectId(
        projectId,
      );
    }
  }, [projectId]);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError("");

    // ----------------------------------------------------------
    // TITLE
    // ----------------------------------------------------------

    if (!title.trim()) {
      setError(
        "Meeting title is required.",
      );

      return;
    }

    if (title.trim().length < 3) {
      setError(
        "Meeting title must contain at least 3 characters.",
      );

      return;
    }

    // ----------------------------------------------------------
    // PROJECT
    // ----------------------------------------------------------

    if (!selectedProjectId) {
      setError(
        "Please select a project.",
      );

      return;
    }

    // ----------------------------------------------------------
    // START / END
    // ----------------------------------------------------------

    if (
      !startTime ||
      !endTime
    ) {
      setError(
        "Start and end time are required.",
      );

      return;
    }

    const start =
      new Date(startTime);

    const end =
      new Date(endTime);

    if (
      Number.isNaN(
        start.getTime(),
      ) ||
      Number.isNaN(
        end.getTime(),
      )
    ) {
      setError(
        "Please enter valid meeting dates.",
      );

      return;
    }

    if (start >= end) {
      setError(
        "End time must be later than start time.",
      );

      return;
    }

    // ----------------------------------------------------------
    // MEETING LINK
    // ----------------------------------------------------------

    if (meetingLink.trim()) {
      try {
        new URL(
          meetingLink.trim(),
        );
      } catch {
        setError(
          "Please enter a valid meeting URL.",
        );

        return;
      }
    }

    // ----------------------------------------------------------
    // DATA
    // ----------------------------------------------------------

    const meetingData:
      CreateMeetingData = {
        title:
          title.trim(),

        description:
          description.trim() ||
          undefined,

        meetingLink:
          meetingLink.trim() ||
          undefined,

        /*
         * THIS is the selected project.
         */
        projectId:
          selectedProjectId,

        participants,

        startTime:
          start.toISOString(),

        endTime:
          end.toISOString(),
      };

    try {
      await onSubmit(
        meetingData,
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
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

        {/* ====================================================
            TITLE
        ==================================================== */}

        <Typography
          variant="h5"
          fontWeight={700}
        >
          Create Meeting
        </Typography>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <Alert
            severity="error"
            onClose={() =>
              setError("")
            }
          >
            {error}
          </Alert>
        )}

        {/* ====================================================
            MEETING TITLE
        ==================================================== */}

        <TextField
          label="Meeting Title"
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value,
            )
          }
          required
          fullWidth
          disabled={loading}
        />

        {/* ====================================================
            PROJECT
        ==================================================== */}

        <TextField
          select
          label="Project"
          value={
            selectedProjectId
          }
          onChange={(event) =>
            setSelectedProjectId(
              event.target.value,
            )
          }
          required
          fullWidth
          disabled={
            loading ||
            projects.length === 0
          }

          /*
           * Scrollable dropdown.
           *
           * Once there are many projects,
           * the menu will scroll instead of
           * making the entire page huge.
           */

          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  maxHeight: 300,
                },
              },
            },
          }}
        >
          {projects.length === 0 ? (
            <MenuItem
              value=""
              disabled
            >
              No projects available
            </MenuItem>
          ) : (
            projects.map(
              (project) => (
                <MenuItem
                  key={
                    project._id
                  }
                  value={
                    project._id
                  }
                >
                  {project.name}
                </MenuItem>
              ),
            )
          )}
        </TextField>

        {/* ====================================================
            DESCRIPTION
        ==================================================== */}

        <TextField
          label="Description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          multiline
          minRows={3}
          fullWidth
          disabled={loading}
        />

        {/* ====================================================
            MEETING LINK
        ==================================================== */}

        <TextField
          label="Meeting Link"
          value={meetingLink}
          onChange={(event) =>
            setMeetingLink(
              event.target.value,
            )
          }
          placeholder="https://meet.google.com/..."
          fullWidth
          disabled={loading}
        />

        {/* ====================================================
            PARTICIPANTS
        ==================================================== */}

        <ParticipantSelector
          users={users}
          selectedParticipants={
            users.filter(
              (user) =>
                participants.includes(
                  user._id,
                ),
            )
          }
          onChange={(
            selectedUsers,
          ) => {
            setParticipants(
              selectedUsers.map(
                (user) =>
                  user._id,
              ),
            );
          }}
          disabled={loading}
        />

        {/* ====================================================
            START TIME
        ==================================================== */}

        <TextField
          label="Start Time"
          type="datetime-local"
          value={startTime}
          onChange={(event) =>
            setStartTime(
              event.target.value,
            )
          }
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          required
          disabled={loading}
        />

        {/* ====================================================
            END TIME
        ==================================================== */}

        <TextField
          label="End Time"
          type="datetime-local"
          value={endTime}
          onChange={(event) =>
            setEndTime(
              event.target.value,
            )
          }
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          required
          disabled={loading}
        />

        {/* ====================================================
            SUBMIT
        ==================================================== */}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={
            loading ||
            projects.length === 0
          }
          sx={{
            textTransform:
              "none",
            fontWeight: 700,
          }}
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