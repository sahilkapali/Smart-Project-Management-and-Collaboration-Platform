import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import projectService from "../../services/project.service";

import type {
  Project,
  ProjectStatus,
  BackendProjectStatus,
} from "../../types/project.types";

interface EditProjectDialogProps {
  open: boolean;

  project: Project;

  onClose: () => void;

  onUpdated: () => void;
}

// =====================================================
// UI STATUS OPTIONS
// =====================================================

const STATUS_OPTIONS: {
  value: ProjectStatus;
  label: string;
}[] = [
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
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
    value: "CANCELLED",
    label: "Cancelled",
  },
];

// =====================================================
// UI → BACKEND
// =====================================================

const UI_TO_BACKEND_STATUS: Record<
  ProjectStatus,
  BackendProjectStatus
> = {
  PENDING: "PLANNING",

  /*
   * IMPORTANT:
   * Your backend already uses ACTIVE.
   *
   * Therefore "In Progress" is represented
   * using ACTIVE on the backend.
   */
  IN_PROGRESS: "ACTIVE",

  ACTIVE: "ACTIVE",

  COMPLETED: "COMPLETED",

  CANCELLED: "ARCHIVED",
};

// =====================================================
// BACKEND → UI
// =====================================================

const backendToUIStatus = (
  status?: string,
): ProjectStatus => {
  switch (status) {
    case "PLANNING":
      return "PENDING";

    case "ACTIVE":
      return "ACTIVE";

    case "COMPLETED":
      return "COMPLETED";

    case "ARCHIVED":
      return "CANCELLED";

    default:
      return "PENDING";
  }
};

// =====================================================
// DATE FORMAT
// =====================================================

const formatDateForInput = (
  value?: string,
) => {
  if (!value) {
    return "";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date
      .toISOString()
      .split("T")[0];
  } catch {
    return "";
  }
};

// =====================================================
// COMPONENT
// =====================================================

const EditProjectDialog = ({
  open,
  project,
  onClose,
  onUpdated,
}: EditProjectDialogProps) => {
  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState<ProjectStatus>(
      "PENDING",
    );

  const [teamId, setTeamId] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ===================================================
  // LOAD PROJECT INTO FORM
  // ===================================================

  useEffect(() => {
    if (!project || !open) {
      return;
    }

    setName(
      project.name || "",
    );

    setDescription(
      project.description || "",
    );

    setStatus(
      backendToUIStatus(
        project.status,
      ),
    );

    setTeamId(
      project.teamId ||
        project.team?._id ||
        project.team?.id ||
        "",
    );

    setStartDate(
      formatDateForInput(
        project.startDate,
      ),
    );

    setDueDate(
      formatDateForInput(
        project.dueDate ||
          project.endDate,
      ),
    );

    setError("");
  }, [project, open]);

  // ===================================================
  // SAVE
  // ===================================================

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "Project name is required.",
      );

      return;
    }

    if (name.trim().length < 3) {
      setError(
        "Project name must be at least 3 characters.",
      );

      return;
    }

    if (
      startDate &&
      dueDate &&
      new Date(startDate) >
        new Date(dueDate)
    ) {
      setError(
        "Due date cannot be earlier than start date.",
      );

      return;
    }

    const projectId =
      project.id ||
      project._id;

    if (!projectId) {
      setError(
        "Project ID is missing.",
      );

      return;
    }

    // ================================================
    // TRANSLATE UI STATUS TO BACKEND STATUS
    // ================================================

    const backendStatus =
      UI_TO_BACKEND_STATUS[
        status
      ];

    const payload: any = {
      name: name.trim(),

      description:
        description.trim(),

      status: backendStatus,
    };

    if (teamId.trim()) {
      payload.teamId =
        teamId.trim();
    }

    if (startDate) {
      payload.startDate =
        startDate;
    }

    if (dueDate) {
      payload.dueDate =
        dueDate;
    }

    try {
      setLoading(true);

      await projectService.updateProject(
        projectId,
        payload,
      );

      onUpdated();

      onClose();
    } catch (err: any) {
      console.error(
        "Update project failed:",
        err,
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update project.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // CLOSE
  // ===================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    setError("");

    onClose();
  };

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
      <form
        onSubmit={
          handleSubmit
        }
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "1.4rem",
          }}
        >
          Edit Project
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <Stack
            spacing={2.5}
            sx={{ mt: 1 }}
          >
            {/* NAME */}

            <TextField
              label="Project Name"
              required
              fullWidth
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
            />

            {/* DESCRIPTION */}

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
            />

            {/* STATUS */}

            <TextField
              select
              label="Status"
              fullWidth
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as ProjectStatus,
                )
              }
            >
              {STATUS_OPTIONS.map(
                (option) => (
                  <MenuItem
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </MenuItem>
                ),
              )}
            </TextField>

            {/* TEAM */}

            <TextField
              label="Team ID"
              fullWidth
              value={teamId}
              onChange={(event) =>
                setTeamId(
                  event.target.value,
                )
              }
            />

            {/* START DATE */}

            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(event) =>
                setStartDate(
                  event.target.value,
                )
              }
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* DUE DATE */}

            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={dueDate}
              onChange={(event) =>
                setDueDate(
                  event.target.value,
                )
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={
              handleClose
            }
            disabled={loading}
            color="inherit"
            sx={{
              textTransform:
                "none",
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              textTransform:
                "none",
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            {loading
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProjectDialog;