import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
}

const ProjectDetails = () => {
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);

  // Dialog and selection states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Loading states
  const [savingTask, setSavingTask] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);
  const [isPrioritizing, setIsPrioritizing] = useState(false);

  // Form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    dueDate: "",
  });

  // Handlers
  const formatStatus = (status: string) => {
    return status;
  };

  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedTask(null);
  };

  const handleOpenDelete = (task: Task) => {
    setSelectedTask(task);
    setDeleteOpen(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveTask = async () => {
    if (!selectedTask) return;
    setSavingTask(true);

    // Add your API call here

    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTask.id ? { ...t, ...editForm } : t)),
    );
    setSavingTask(false);
    handleCloseEdit();
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    setDeletingTask(true);

    // Add your API call here

    setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
    setDeletingTask(false);
    setDeleteOpen(false);
    setSelectedTask(null);
  };

  // FIXED: Added an underscore to '_task' so TypeScript knows it's intentionally unused for now
  const handleAIPrioritize = async (_task: Task) => {
    setIsPrioritizing(true);

    // Add your AI logic/API call here

    setIsPrioritizing(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Project Tasks
      </Typography>

      <Card>
        <CardContent>
          {tasks.length === 0 ? (
            <Typography color="text.secondary">No tasks available.</Typography>
          ) : (
            <Stack spacing={2}>
              {tasks.map((task) => {
                return (
                  <Card key={task.id} variant="outlined">
                    <CardContent>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box>
                          <Typography variant="h6">{task.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {task.description}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenEdit(task)}
                            sx={{ textTransform: "none" }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => handleOpenDelete(task)}
                            sx={{ textTransform: "none" }}
                          >
                            Delete
                          </Button>

                          <Button
                            size="small"
                            color="info"
                            variant="outlined"
                            startIcon={
                              isPrioritizing ? (
                                <CircularProgress size={16} />
                              ) : (
                                <AutoAwesomeRoundedIcon />
                              )
                            }
                            onClick={() => handleAIPrioritize(task)}
                            disabled={isPrioritizing}
                            sx={{ textTransform: "none" }}
                          >
                            {isPrioritizing
                              ? "Prioritizing..."
                              : "AI Prioritize"}
                          </Button>
                        </Stack>
                      </Stack>

                      {/* =================================
                          TASK METADATA
                      ================================= */}
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ mt: 2 }}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Typography variant="caption" color="text.secondary">
                          <strong>Status:</strong> {formatStatus(task.status)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Priority:</strong> {task.priority || "None"}
                        </Typography>
                        {task.dueDate && (
                          <Typography variant="caption" color="text.secondary">
                            <strong>Due:</strong>{" "}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* ====================================================
          EDIT TASK DIALOG
      ==================================================== */}
      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={700}>Edit Task</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={editForm.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={editForm.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
            />
            <TextField
              select
              label="Status"
              fullWidth
              value={editForm.status}
              onChange={(e) => handleFormChange("status", e.target.value)}
            >
              <MenuItem value="Todo">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
            <TextField
              select
              label="Priority"
              fullWidth
              value={editForm.priority}
              onChange={(e) => handleFormChange("priority", e.target.value)}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </TextField>
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={editForm.dueDate}
              onChange={(e) => handleFormChange("dueDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseEdit}
            color="inherit"
            disabled={savingTask}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTask}
            variant="contained"
            disabled={savingTask}
            startIcon={savingTask && <CircularProgress size={16} />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====================================================
          DELETE TASK DIALOG
      ==================================================== */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle fontWeight={700}>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the task{" "}
            <strong>{selectedTask?.title}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            color="inherit"
            disabled={deletingTask}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTask}
            color="error"
            variant="contained"
            disabled={deletingTask}
            startIcon={deletingTask && <CircularProgress size={16} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetails;
