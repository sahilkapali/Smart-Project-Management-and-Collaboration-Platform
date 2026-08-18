import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import projectService from "../../services/project.service";

import type {
  Project,
  ProjectStatus,
  UpdateProjectPayload,
} from "../../types/project.types";

// ============================================================
// PROPS
// ============================================================

interface EditProjectDialogProps {
  open: boolean;

  project: Project;

  onClose: () => void;

  onUpdated: () => void;
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
// API ERROR TYPE
// ============================================================

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// ============================================================
// EDIT PROJECT DIALOG
// ============================================================

const EditProjectDialog = ({
  open,
  project,
  onClose,
  onUpdated,
}: EditProjectDialogProps) => {
  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [status, setStatus] = useState<ProjectStatus>("PLANNING");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [progress, setProgress] = useState(0);

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // POPULATE FORM
  // ==========================================================

  useEffect(() => {
    if (!open || !project) {
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

    setError("");
  }, [project, open]);

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    setError("");

    onClose();
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    // --------------------------------------------------------
    // Project name validation
    // --------------------------------------------------------

    if (!name.trim()) {
      setError("Project name is required.");

      return;
    }

    // --------------------------------------------------------
    // Date validation
    // --------------------------------------------------------

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("End date cannot be earlier than the start date.");

      return;
    }

    // --------------------------------------------------------
    // Progress validation
    // --------------------------------------------------------

    if (progress < 0 || progress > 100) {
      setError("Project progress must be between 0 and 100.");

      return;
    }

    // --------------------------------------------------------
    // Update payload
    // --------------------------------------------------------

    const updateData: UpdateProjectPayload = {
      name: name.trim(),

      description: description.trim(),

      status,

      progress,

      ...(startDate
        ? {
            startDate,
          }
        : {}),

      ...(endDate
        ? {
            endDate,
          }
        : {}),
    };

    try {
      setLoading(true);

      // ------------------------------------------------------
      // UPDATE PROJECT
      // ------------------------------------------------------

      await projectService.updateProject(project.id, updateData);

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      onUpdated();

      onClose();
    } catch (error: unknown) {
      console.error("Failed to update project:", error);

      const axiosError = error as {
        response?: {
          data?: ApiErrorResponse;
        };
      };

      const backendMessage =
        axiosError.response?.data?.message || axiosError.response?.data?.error;

      setError(backendMessage || "Failed to update project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* ==================================================
            TITLE
        ================================================== */}

        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "1.5rem",
          }}
        >
          Edit Project
        </DialogTitle>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <DialogContent>
          <Stack
            spacing={2.5}
            sx={{
              mt: 1,
            }}
          >
            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            {/* ==================================================
                NAME
            ================================================== */}

            <TextField
              label="Project Name"
              required
              fullWidth
              value={name}
              onChange={(event) => setName(event.target.value)}
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
              fullWidth
              multiline
              minRows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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
              fullWidth
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ProjectStatus)
              }
              disabled={loading}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {/* ==================================================
                DATES
            ================================================== */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },

                gap: 2,
              }}
            >
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="Project Deadline"
                type="date"
                fullWidth
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>

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

                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="primary.main"
                >
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
            </Box>
          </Stack>
        </DialogContent>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 1,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            color="inherit"
            sx={{
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading || !name.trim()}
            disableElevation
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveRoundedIcon />
              )
            }
            sx={{
              minWidth: 150,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            {loading
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EditProjectDialog;
