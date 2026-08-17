import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import projectService from "../../services/project.service";

import type {
  CreateProjectPayload,
  ProjectStatus,
} from "../../types/project.types";

// ============================================================
// PROPS
// ============================================================

interface CreateProjectDialogProps {
  open: boolean;

  onClose: () => void;

  onCreated?: () => void;
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
// ERROR TYPE
// ============================================================

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// ============================================================
// CREATE PROJECT DIALOG
// ============================================================

const CreateProjectDialog = ({
  open,
  onClose,
  onCreated,
}: CreateProjectDialogProps) => {
  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [projectName, setProjectName] = useState("");

  const [description, setDescription] = useState("");

  const [status, setStatus] = useState<ProjectStatus>("PLANNING");

  const [teamId, setTeamId] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [progress, setProgress] = useState(0);

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setProjectName("");

    setDescription("");

    setStatus("PLANNING");

    setTeamId("");

    setStartDate("");

    setEndDate("");

    setProgress(0);

    setError("");
  };

  // ==========================================================
  // RESET WHEN DIALOG OPENS
  // ==========================================================

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // ==========================================================
  // CLOSE DIALOG
  // ==========================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    resetForm();

    onClose();
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async () => {
    setError("");

    // --------------------------------------------------------
    // Project name validation
    // --------------------------------------------------------

    if (!projectName.trim()) {
      setError("Project name is required.");

      return;
    }

    // --------------------------------------------------------
    // Team validation
    // --------------------------------------------------------

    if (!teamId.trim()) {
      setError("Team ID is required.");

      return;
    }

    // --------------------------------------------------------
    // Date validation
    // --------------------------------------------------------

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("End date cannot be before the start date.");

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
    // Payload
    // --------------------------------------------------------

    const payload: CreateProjectPayload = {
      name: projectName.trim(),

      description: description.trim(),

      status,

      teamId: teamId.trim(),

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
      // CREATE PROJECT
      // ------------------------------------------------------

      await projectService.createProject(payload);

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      resetForm();

      onCreated?.();

      onClose();
    } catch (error: unknown) {
      console.error("Create project failed:", error);

      // ------------------------------------------------------
      // Extract backend error safely
      // ------------------------------------------------------

      const axiosError = error as {
        response?: {
          data?: ApiErrorResponse;
        };
      };

      const backendMessage =
        axiosError.response?.data?.message || axiosError.response?.data?.error;

      setError(
        backendMessage ||
          "Unable to create project. Please check the information and try again.",
      );
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

          p: {
            xs: 1,
            sm: 2,
          },
        },
      }}
    >
      <DialogContent>
        <Stack spacing={2.5}>
          {/* ==================================================
              HEADER
          ================================================== */}

          <Box
            sx={{
              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: "1.6rem",
                  sm: "2rem",
                },

                fontWeight: 700,
              }}
            >
              Create Project
            </Typography>

            <IconButton
              onClick={handleClose}
              disabled={loading}
              aria-label="Close create project dialog"
              sx={{
                color: "text.secondary",
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>

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
              PROJECT NAME
          ================================================== */}

          <TextField
            label="Project Name"
            required
            fullWidth
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            disabled={loading}
            inputProps={{
              maxLength: 150,
            }}
            helperText={`${projectName.length}/150`}
          />

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <TextField
            label="Description"
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
              TEAM ID
          ================================================== */}

          <TextField
            label="Team ID"
            required
            fullWidth
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            disabled={loading}
            placeholder="Enter an existing team ID"
            helperText="Enter the ID of an existing team that you belong to."
          />

          {/* ==================================================
              STATUS
          ================================================== */}

          <TextField
            select
            label="Project Status"
            fullWidth
            value={status}
            onChange={(event) => setStatus(event.target.value as ProjectStatus)}
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
            {/* Start Date */}

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

            {/* Deadline */}

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
                Initial Project Progress
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
              aria-label="Initial project progress"
            />
          </Box>

          {/* ==================================================
              BUTTONS
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
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              sx={{
                minWidth: 120,

                borderRadius: 2,

                textTransform: "none",

                fontWeight: 700,
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SaveRoundedIcon />
                )
              }
              onClick={handleSubmit}
              disabled={loading || !projectName.trim() || !teamId.trim()}
              sx={{
                minWidth: 170,

                borderRadius: 2,

                textTransform: "none",

                fontWeight: 700,
              }}
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
