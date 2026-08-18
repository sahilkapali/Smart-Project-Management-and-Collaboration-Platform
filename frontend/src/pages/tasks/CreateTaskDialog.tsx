import { useEffect, useState } from "react";

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

  // ==========================================================
  // RESET FORM
  // ==========================================================

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setAssignedTo("");
      setDueDate("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async () => {
    if (!projectId) {
      setError("Project ID is missing.");
      return;
    }

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (title.trim().length < 3) {
      setError("Task title must be at least 3 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload: CreateTaskPayload = {
        project: projectId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assignedTo: assignedTo.trim() || undefined,
        dueDate: dueDate || undefined,
      };

      const createdTask = await taskService.createTask(payload);

      onCreated(createdTask);

      onClose();
    } catch (err: any) {
      console.error("Create task failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create task.",
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
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Create New Task</DialogTitle>

      <DialogContent>
        <Stack
          spacing={2.5}
          sx={{
            pt: 1,
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Task Title"
            placeholder="Enter task title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            autoFocus
          />

          <TextField
            fullWidth
            label="Description"
            placeholder="Enter task description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            multiline
            minRows={4}
          />

          <FormControl fullWidth>
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

          <TextField
            fullWidth
            label="Assigned User ID"
            placeholder="Enter user ID"
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            helperText="Optional"
          />

          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Optional"
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
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
    </Dialog>
  );
};

export default CreateTaskDialog;
