import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import type {
  Project,
  ProjectStatus,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "../../types/project.types";

// ============================================================
// PROPS
// ============================================================

interface ProjectFormProps {
  project?: Project | null;

  loading?: boolean;

  error?: string;

  onSubmit: (data: CreateProjectPayload | UpdateProjectPayload) => void;

  onCancel: () => void;
}

// ============================================================
// STATUS OPTIONS
// ============================================================

const STATUS_OPTIONS: Array<{
  value: ProjectStatus;
  label: string;
}> = [
  {
    value: "PLANNING",
    label: "Planning",
  },
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
  },
];

// ============================================================
// PROJECT FORM
// ============================================================

const ProjectForm = ({
  project,
  loading = false,
  error = "",
  onSubmit,
  onCancel,
}: ProjectFormProps) => {
  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [teamId, setTeamId] = useState("");

  const [status, setStatus] = useState<ProjectStatus>("PLANNING");

  const [startDate, setStartDate] = useState("");

  const [dueDate, setDueDate] = useState("");

  const [validationError, setValidationError] = useState("");

  // ==========================================================
  // LOAD PROJECT INTO FORM
  // ==========================================================

  useEffect(() => {
    if (!project) {
      setName("");
      setDescription("");
      setTeamId("");
      setStatus("PLANNING");
      setStartDate("");
      setDueDate("");
      setValidationError("");

      return;
    }

    setName(project.name ?? "");

    setDescription(project.description ?? "");

    setTeamId(project.teamId ?? "");

    setStatus(project.status ?? "PLANNING");

    setStartDate(project.startDate ? project.startDate.slice(0, 10) : "");

    setDueDate(project.dueDate ? project.dueDate.slice(0, 10) : "");

    setValidationError("");
  }, [project]);

  // ==========================================================
  // FORM SUBMIT
  // ==========================================================

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setValidationError("");

    // --------------------------------------------------------
    // Name validation
    // --------------------------------------------------------

    const trimmedName = name.trim();

    if (!trimmedName) {
      setValidationError("Project name is required.");

      return;
    }

    if (trimmedName.length < 3) {
      setValidationError("Project name must be at least 3 characters long.");

      return;
    }

    if (trimmedName.length > 100) {
      setValidationError("Project name cannot exceed 100 characters.");

      return;
    }

    // --------------------------------------------------------
    // Team validation
    // --------------------------------------------------------

    if (!teamId.trim()) {
      setValidationError("Team ID is required.");

      return;
    }

    // --------------------------------------------------------
    // Date validation
    // --------------------------------------------------------

    if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
      setValidationError("Due date cannot be earlier than the start date.");

      return;
    }

    // --------------------------------------------------------
    // CREATE PAYLOAD
    // --------------------------------------------------------

    if (!project) {
      const createPayload: CreateProjectPayload = {
        name: trimmedName,

        description: description.trim() || undefined,

        teamId: teamId.trim(),

        status,

        startDate: startDate || undefined,

        dueDate: dueDate || undefined,
      };

      onSubmit(createPayload);

      return;
    }

    // --------------------------------------------------------
    // UPDATE PAYLOAD
    // --------------------------------------------------------

    const updatePayload: UpdateProjectPayload = {
      name: trimmedName,

      description: description.trim() || undefined,

      teamId: teamId.trim(),

      status,

      startDate: startDate || undefined,

      dueDate: dueDate || undefined,
    };

    onSubmit(updatePayload);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        {/* ==================================================
            ERROR
        ================================================== */}

        {(error || validationError) && (
          <Alert severity="error">{validationError || error}</Alert>
        )}

        {/* ==================================================
            PROJECT NAME
        ================================================== */}

        <TextField
          label="Project Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          fullWidth
          disabled={loading}
          inputProps={{
            maxLength: 100,
          }}
          helperText={`${name.length}/100`}
        />

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <TextField
          label="Project Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          multiline
          minRows={4}
          fullWidth
          disabled={loading}
          inputProps={{
            maxLength: 500,
          }}
          helperText={`${description.length}/500`}
        />

        {/* ==================================================
            TEAM ID
        ================================================== */}

        <TextField
          label="Team ID"
          value={teamId}
          onChange={(event) => setTeamId(event.target.value)}
          required
          fullWidth
          disabled={loading}
          placeholder="Enter team ID"
          helperText="Enter the ID of the team this project belongs to."
        />

        {/* ==================================================
            STATUS
        ================================================== */}

        <TextField
          select
          label="Project Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as ProjectStatus)}
          fullWidth
          disabled={loading}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {/* ==================================================
            PROJECT DATES
        ================================================== */}

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
        >
          {/* Start Date */}

          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            disabled={loading}
          />

          {/* Due Date */}

          <TextField
            label="Project Deadline"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            disabled={loading}
          />
        </Stack>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1.5}
          sx={{
            pt: 1,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveRoundedIcon />
              )
            }
            disabled={loading || !name.trim() || !teamId.trim()}
          >
            {project ? "Update Project" : "Create Project"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ProjectForm;
