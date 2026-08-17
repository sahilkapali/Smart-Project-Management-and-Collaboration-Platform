import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography,
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

  const [status, setStatus] = useState<ProjectStatus>("PLANNING");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [progress, setProgress] = useState(0);

  const [validationError, setValidationError] = useState("");

  // ==========================================================
  // LOAD PROJECT INTO FORM
  // ==========================================================

  useEffect(() => {
    if (!project) {
      setName("");
      setDescription("");
      setStatus("PLANNING");
      setStartDate("");
      setEndDate("");
      setProgress(0);
      setValidationError("");

      return;
    }

    setName(project.name ?? "");

    setDescription(project.description ?? "");

    setStatus(project.status ?? "PLANNING");

    setStartDate(project.startDate ? project.startDate.slice(0, 10) : "");

    setEndDate(project.endDate ? project.endDate.slice(0, 10) : "");

    setProgress(
      typeof project.progress === "number"
        ? Math.min(100, Math.max(0, project.progress))
        : 0,
    );

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

    if (!name.trim()) {
      setValidationError("Project name is required.");

      return;
    }

    // --------------------------------------------------------
    // Date validation
    // --------------------------------------------------------

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setValidationError("End date cannot be earlier than the start date.");

      return;
    }

    // --------------------------------------------------------
    // Progress validation
    // --------------------------------------------------------

    if (progress < 0 || progress > 100) {
      setValidationError("Project progress must be between 0 and 100.");

      return;
    }

    // --------------------------------------------------------
    // Prepare payload
    // --------------------------------------------------------

    const payload = {
      name: name.trim(),

      description: description.trim(),

      status,

      startDate: startDate || undefined,

      endDate: endDate || undefined,

      progress,
    };

    onSubmit(payload);
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
            maxLength: 150,
          }}
          helperText={`${name.length}/150`}
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
            maxLength: 1000,
          }}
          helperText={`${description.length}/1000`}
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

          {/* Deadline */}

          <TextField
            label="Project Deadline"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            disabled={loading}
          />
        </Stack>

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mb: 1,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Project Progress
            </Typography>

            <Typography variant="body2" fontWeight={700} color="primary.main">
              {progress}%
            </Typography>
          </Stack>

          <Slider
            value={progress}
            onChange={(_event, value) => {
              if (typeof value === "number") {
                setProgress(value);
              }
            }}
            min={0}
            max={100}
            step={5}
            valueLabelDisplay="auto"
            disabled={loading}
            aria-label="Project progress"
          />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              0%
            </Typography>

            <Typography variant="caption" color="text.secondary">
              100%
            </Typography>
          </Stack>
        </Box>

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
            disabled={loading || !name.trim()}
          >
            {project ? "Update Project" : "Create Project"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ProjectForm;
