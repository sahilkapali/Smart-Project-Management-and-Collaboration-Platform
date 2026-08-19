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
  Stack,
  TextField,
} from "@mui/material";

import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import projectService from "../../services/project.service";

import type {
  Project,
  ProjectStatus,
  UpdateProjectPayload,
} from "../../types/project.types";

/* ============================================================
   PROPS
   ============================================================ */

interface EditProjectDialogProps {
  open: boolean;

  project: Project;

  onClose: () => void;

  onUpdated: () => void;
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
   EDIT PROJECT DIALOG
   ============================================================ */

const EditProjectDialog = ({
  open,

  project,

  onClose,

  onUpdated,
}: EditProjectDialogProps) => {
  /* ==========================================================
     FORM STATE
     ========================================================== */

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [status, setStatus] = useState<ProjectStatus>("PLANNING");

  const [startDate, setStartDate] = useState("");

  const [dueDate, setDueDate] = useState("");

  /* ==========================================================
     UI STATE
     ========================================================== */

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* ==========================================================
     LOAD PROJECT
     ========================================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(project.name ?? "");

    setDescription(project.description ?? "");

    setStatus(project.status ?? "PLANNING");

    setStartDate(project.startDate ? project.startDate.slice(0, 10) : "");

    setDueDate(project.dueDate ? project.dueDate.slice(0, 10) : "");

    setError("");
  }, [project, open]);

  /* ==========================================================
     CLOSE
     ========================================================== */

  const handleClose = () => {
    if (loading) {
      return;
    }

    setError("");

    onClose();
  };

  /* ==========================================================
     SUBMIT
     ========================================================== */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    /* --------------------------------------------------------
       NAME
       -------------------------------------------------------- */

    if (!name.trim()) {
      setError("Project name is required.");

      return;
    }

    if (name.trim().length < 3) {
      setError("Project name must be at least 3 characters long.");

      return;
    }

    if (name.trim().length > 100) {
      setError("Project name cannot exceed 100 characters.");

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
       DATES
       -------------------------------------------------------- */

    if (startDate && dueDate && startDate > dueDate) {
      setError("Project deadline cannot be before the start date.");

      return;
    }

    /* --------------------------------------------------------
       PAYLOAD
       -------------------------------------------------------- */

    const updateData: UpdateProjectPayload = {
      name: name.trim(),

      description: description.trim(),

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

      await projectService.updateProject(
        project.id,

        updateData,
      );

      /* ------------------------------------------------------
         SUCCESS
         ------------------------------------------------------ */

      onUpdated();

      onClose();
    } catch (error: unknown) {
      console.error("Failed to update project:", error);

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

      setError(backendMessage || "Failed to update project. Please try again.");
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
                maxLength: 100,
              }}
              helperText={`${name.length}/100`}
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
                maxLength: 500,
              }}
              helperText={`${description.length}/500`}
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
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EditProjectDialog;
