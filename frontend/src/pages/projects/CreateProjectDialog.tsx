import {
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
  ProjectStatus,
  BackendProjectStatus,
} from "../../types/project.types";

interface CreateProjectDialogProps {
  open: boolean;

  onClose: () => void;

  onCreated: () => void;
}

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

const UI_TO_BACKEND_STATUS: Record<
  ProjectStatus,
  BackendProjectStatus
> = {
  PENDING: "PLANNING",

  IN_PROGRESS: "ACTIVE",

  ACTIVE: "ACTIVE",

  COMPLETED: "COMPLETED",

  CANCELLED: "ARCHIVED",
};

const CreateProjectDialog = ({
  open,
  onClose,
  onCreated,
}: CreateProjectDialogProps) => {
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

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("PENDING");
    setTeamId("");
    setStartDate("");
    setDueDate("");
    setError("");
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    resetForm();

    onClose();
  };

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

    if (!teamId.trim()) {
      setError(
        "Team ID is required.",
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

    const payload: any = {
      name: name.trim(),

      description:
        description.trim(),

      status:
        UI_TO_BACKEND_STATUS[
          status
        ],

      teamId:
        teamId.trim(),
    };

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

      await projectService.createProject(
        payload,
      );

      resetForm();

      onCreated();

      onClose();
    } catch (err: any) {
      console.error(
        "Create project failed:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to create project.",
      );
    } finally {
      setLoading(false);
    }
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
          }}
        >
          New Project
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <Stack
            spacing={2.5}
            sx={{
              mt: 1,
            }}
          >
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

            <TextField
              label="Team ID"
              required
              fullWidth
              value={teamId}
              onChange={(event) =>
                setTeamId(
                  event.target.value,
                )
              }
            />

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
            }}
          >
            {loading
              ? "Creating..."
              : "Create Project"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateProjectDialog;