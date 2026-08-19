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

/* ============================================================
   PROPS
   ============================================================ */

interface CreateProjectDialogProps {
  open: boolean;

  onClose: () => void;

  onCreated?: () => void;
}

/* ============================================================
   STATUS OPTIONS
   ============================================================ */

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

/* ============================================================
   API ERROR
   ============================================================ */

interface ApiErrorResponse {
  message?: string;

  error?: string;
}

/* ============================================================
   CREATE PROJECT DIALOG
   ============================================================ */

const CreateProjectDialog = ({
  open,
  onClose,
  onCreated,
}: CreateProjectDialogProps) => {
  /* ==========================================================
     FORM STATE
     ========================================================== */

  const [projectName, setProjectName] = useState("");

  const [description, setDescription] = useState("");

  const [status, setStatus] = useState<ProjectStatus>("PLANNING");

  const [teamId, setTeamId] = useState("");

  const [startDate, setStartDate] = useState("");

  const [dueDate, setDueDate] = useState("");

  /* ==========================================================
     UI STATE
     ========================================================== */

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* ==========================================================
     RESET FORM
     ========================================================== */

  const resetForm = () => {
    setProjectName("");

    setDescription("");

    setStatus("PLANNING");

    setTeamId("");

    setStartDate("");

    setDueDate("");

    setError("");
  };

  /* ==========================================================
     RESET WHEN OPENED
     ========================================================== */

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  /* ==========================================================
     CLOSE
     ========================================================== */

  const handleClose = () => {
    if (loading) {
      return;
    }

    resetForm();

    onClose();
  };

  /* ==========================================================
     SUBMIT
     ========================================================== */

  const handleSubmit = async () => {
    setError("");

    /* --------------------------------------------------------
       NAME
       -------------------------------------------------------- */

    if (!projectName.trim()) {
      setError("Project name is required.");

      return;
    }

    /* --------------------------------------------------------
       NAME LENGTH
       -------------------------------------------------------- */

    if (projectName.trim().length < 3) {
      setError("Project name must be at least 3 characters long.");

      return;
    }

    if (projectName.trim().length > 100) {
      setError("Project name cannot exceed 100 characters.");

      return;
    }

    /* --------------------------------------------------------
       TEAM
       -------------------------------------------------------- */

    if (!teamId.trim()) {
      setError("Team ID is required.");

      return;
    }

    /* --------------------------------------------------------
       DESCRIPTION
       -------------------------------------------------------- */

    if (description.length > 500) {
      setError("Description cannot exceed 500 characters.");

      return;
    }

    /* --------------------------------------------------------
       DATE
       -------------------------------------------------------- */

    if (startDate && dueDate && startDate > dueDate) {
      setError("Project deadline cannot be before the start date.");

      return;
    }

    /* --------------------------------------------------------
       PAYLOAD
       -------------------------------------------------------- */

    const payload: CreateProjectPayload = {
      name: projectName.trim(),

      description: description.trim(),

      teamId: teamId.trim(),

      status,

      ...(startDate
        ? {
            startDate,
          }
        : {}),

      ...(dueDate
        ? {
            dueDate,
          }
        : {}),
    };

    /* ========================================================
       API
       ======================================================== */

    try {
      setLoading(true);

      await projectService.createProject(payload);

      /* ------------------------------------------------------
         SUCCESS
         ------------------------------------------------------ */

      resetForm();

      onCreated?.();

      onClose();
    } catch (error: unknown) {
      console.error("Create project failed:", error);

      const axiosError = error as {
        response?: {
          data?: ApiErrorResponse;
        };

        message?: string;
      };

      const backendMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message;

      setError(backendMessage || "Unable to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     RENDER
     ========================================================== */

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
              maxLength: 100,
            }}
            helperText={`${projectName.length}/100`}
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
              maxLength: 500,
            }}
            helperText={`${description.length}/500`}
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
            helperText="Enter the ID of the team for this project."
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
            {/* ------------------------------------------------
                START DATE
            ------------------------------------------------ */}

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

            {/* ------------------------------------------------
                DEADLINE
            ------------------------------------------------ */}

            <TextField
              label="Project Deadline"
              type="date"
              fullWidth
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              disabled={loading}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
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
