import { type FormEvent, useEffect, useState } from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

import type {
  CreateTaskPayload,
  Task,
  TaskPriority,
} from "../../types/task.types";

import taskService from "../../services/task.service";

interface CreateTaskDialogProps {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onCreated: (task: Task) => void;
}

const CreateTaskDialog = ({
  open,
  projectId,
  onClose,
  onCreated,
}: CreateTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // RESET FORM
  // ----------------------------------------------------------

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle("");
    setDescription("");
    setPriority("Medium");
    setAssignedTo("");
    setDueDate("");
    setError("");
    setLoading(false);
  }, [open]);

  // ----------------------------------------------------------
  // CLOSE
  // ----------------------------------------------------------

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  // ----------------------------------------------------------
  // CREATE TASK
  // ----------------------------------------------------------

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const trimmedTitle = title.trim();

    if (!projectId) {
      setError("Project ID is required.");
      return;
    }

    if (!trimmedTitle) {
      setError("Task title is required.");
      return;
    }

    if (trimmedTitle.length < 2) {
      setError("Task title must contain at least 2 characters.");
      return;
    }

    try {
      setLoading(true);

      const payload: CreateTaskPayload = {
        project: projectId,
        title: trimmedTitle,
        priority,
      };

      if (description.trim()) {
        payload.description = description.trim();
      }

      if (assignedTo.trim()) {
        payload.assignedTo = assignedTo.trim();
      }

      if (dueDate) {
        payload.dueDate = new Date(dueDate).toISOString();
      }

      const createdTask = await taskService.createTask(payload);

      onCreated(createdTask);

      onClose();
    } catch (err: any) {
      console.error("Creating task failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create task.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Task</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* TITLE */}

            <TextField
              label="Task Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              fullWidth
              required
              autoFocus
              disabled={loading}
              placeholder="Enter task title"
            />

            {/* DESCRIPTION */}

            <TextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
              multiline
              minRows={4}
              disabled={loading}
              placeholder="Describe the task..."
            />

            {/* PRIORITY */}

            <FormControl fullWidth disabled={loading}>
              <InputLabel>Priority</InputLabel>

              <Select
                value={priority}
                label="Priority"
                onChange={(event) =>
                  setPriority(event.target.value as TaskPriority)
                }
              >
                <MenuItem value="Low">Low</MenuItem>

                <MenuItem value="Medium">Medium</MenuItem>

                <MenuItem value="High">High</MenuItem>

                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
            </FormControl>

            {/* ASSIGNED TO */}

            <TextField
              label="Assigned User ID"
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              fullWidth
              disabled={loading}
              placeholder="Enter user ID"
              helperText="Leave empty if the task is unassigned."
            />

            {/* DUE DATE */}

            <TextField
              label="Due Date"
              type="datetime-local"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              fullWidth
              disabled={loading}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              minWidth: 120,
            }}
          >
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateTaskDialog;
