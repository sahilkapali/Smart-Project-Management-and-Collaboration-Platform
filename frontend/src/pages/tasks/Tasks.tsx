import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import taskService from "../../services/task.service";
import projectService from "../../services/project.service";

import CreateTaskDialog from "./CreateTaskDialog";

import type {
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskPayload,
} from "../../types/task.types";

import type { Project } from "../../types/project.types";

// ============================================================
// CONSTANTS
// ============================================================

const SELECTED_PROJECT_STORAGE_KEY = "selectedProjectId";

type ProjectOption = Project;

// ============================================================
// COMPONENT
// ============================================================

const Tasks = () => {
  const navigate = useNavigate();

  const { projectId: routeProjectId } = useParams<{
    projectId?: string;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();

  // ==========================================================
  // PROJECT STATE
  // ==========================================================

  const [projects, setProjects] = useState<ProjectOption[]>([]);

  const [projectsLoading, setProjectsLoading] = useState(true);

  const [projectsError, setProjectsError] = useState("");

  const [selectedProjectId, setSelectedProjectId] = useState("");

  // ==========================================================
  // TASK STATE
  // ==========================================================

  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // FILTER STATE
  // ==========================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");

  const [priorityFilter, setPriorityFilter] = useState<"ALL" | TaskPriority>(
    "ALL",
  );

  // ==========================================================
  // CREATE TASK
  // ==========================================================

  const [createOpen, setCreateOpen] = useState(false);

  // ==========================================================
  // EDIT TASK
  // ==========================================================

  const [editOpen, setEditOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [editLoading, setEditLoading] = useState(false);

  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: string;
    dueDate: string;
  }>({
    title: "",
    description: "",
    status: "Todo",
    priority: "Medium",
    assignedTo: "",
    dueDate: "",
  });

  // ==========================================================
  // DELETE TASK
  // ==========================================================

  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  // ==========================================================
  // AI PROJECT PRIORITIZATION
  // ==========================================================

  const [aiLoading, setAiLoading] = useState(false);

  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const [aiMessage, setAiMessage] = useState("");

  const [aiTasks, setAiTasks] = useState<Task[]>([]);

  const [aiError, setAiError] = useState("");

  // ==========================================================
  // DETERMINE PROJECT ID
  // ==========================================================

  const queryProjectId = searchParams.get("project");

  const storedProjectId =
    typeof window !== "undefined"
      ? localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY)
      : null;

  /*
   * IMPORTANT:
   *
   * This value MUST be the PROJECT ID.
   *
   * The AI endpoint is project-wide:
   *
   * PATCH /api/tasks/:projectId/ai-prioritize
   *
   * Do NOT pass task.id here.
   */
  const activeProjectId =
    routeProjectId ||
    queryProjectId ||
    selectedProjectId ||
    storedProjectId ||
    "";

  // ==========================================================
  // LOAD PROJECTS
  // ==========================================================

  const loadProjects = useCallback(async () => {
    try {
      setProjectsLoading(true);
      setProjectsError("");

      const data = await projectService.getProjects();

      const projectList = Array.isArray(data) ? data : [];

      setProjects(projectList);

      const validProjectIds = projectList
        .map((project) => project.id)
        .filter((id): id is string => Boolean(id));

      // ------------------------------------------------------
      // ROUTE PROJECT
      // ------------------------------------------------------

      if (routeProjectId && validProjectIds.includes(routeProjectId)) {
        setSelectedProjectId(routeProjectId);

        localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, routeProjectId);

        return;
      }

      // ------------------------------------------------------
      // QUERY PROJECT
      // ------------------------------------------------------

      if (queryProjectId && validProjectIds.includes(queryProjectId)) {
        setSelectedProjectId(queryProjectId);

        localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, queryProjectId);

        return;
      }

      // ------------------------------------------------------
      // CURRENT SELECTED PROJECT
      // ------------------------------------------------------

      if (selectedProjectId && validProjectIds.includes(selectedProjectId)) {
        return;
      }

      // ------------------------------------------------------
      // STORED PROJECT
      // ------------------------------------------------------

      if (storedProjectId && validProjectIds.includes(storedProjectId)) {
        setSelectedProjectId(storedProjectId);

        if (!routeProjectId && !queryProjectId) {
          setSearchParams(
            {
              project: storedProjectId,
            },
            {
              replace: true,
            },
          );
        }

        return;
      }

      // ------------------------------------------------------
      // FIRST PROJECT
      // ------------------------------------------------------

      if (projectList.length > 0) {
        const firstProjectId = projectList[0].id;

        if (firstProjectId) {
          setSelectedProjectId(firstProjectId);

          localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, firstProjectId);

          if (!routeProjectId) {
            setSearchParams(
              {
                project: firstProjectId,
              },
              {
                replace: true,
              },
            );
          }
        }
      }
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      setProjectsError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load projects.",
      );

      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, [
    routeProjectId,
    queryProjectId,
    selectedProjectId,
    storedProjectId,
    setSearchParams,
  ]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  // ==========================================================
  // SELECT PROJECT
  // ==========================================================

  const handleProjectChange = (projectId: string) => {
    if (!projectId) {
      return;
    }

    setSelectedProjectId(projectId);

    localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, projectId);

    setError("");

    if (routeProjectId) {
      navigate(`/projects/${projectId}/tasks`);
      return;
    }

    setSearchParams({
      project: projectId,
    });
  };

  // ==========================================================
  // CURRENT PROJECT
  // ==========================================================

  const selectedProject = useMemo(() => {
    return projects.find((project) => project.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  // ==========================================================
  // LOAD TASKS
  // ==========================================================

  const loadTasks = useCallback(async () => {
    if (!activeProjectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await taskService.getTasks(activeProjectId);

      setTasks(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load tasks.",
      );

      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (!projectsLoading) {
      void loadTasks();
    }
  }, [loadTasks, projectsLoading]);

  // ==========================================================
  // GET TASK ID
  // ==========================================================

  const getTaskId = (task: Task): string => {
    return task.id || task._id || "";
  };

  // ==========================================================
  // FILTER TASKS
  // ==========================================================

  const filteredTasks = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const title = task.title?.toLowerCase() || "";

      const description = task.description?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        description.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  // ==========================================================
  // KANBAN GROUPS
  // ==========================================================

  const todoTasks = filteredTasks.filter((task) => task.status === "Todo");

  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "In Progress",
  );

  const completedTasks = filteredTasks.filter(
    (task) => task.status === "Completed",
  );

  // ==========================================================
  // STATUS LABEL
  // ==========================================================

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case "Todo":
        return "To Do";

      case "In Progress":
        return "In Progress";

      case "Completed":
        return "Completed";

      default:
        return status;
    }
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (value?: string | null): string => {
    if (!value) {
      return "No due date";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString();
  };

  // ==========================================================
  // GET ASSIGNEE NAME
  // ==========================================================

  const getAssigneeName = (task: Task): string => {
    if (!task.assignedTo) {
      return "Unassigned";
    }

    if (typeof task.assignedTo === "object") {
      if (task.assignedTo.name) {
        return task.assignedTo.name;
      }

      const fullName = [task.assignedTo.firstName, task.assignedTo.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      return fullName || task.assignedTo.email || "Unassigned";
    }

    return task.assignedTo;
  };

  // ==========================================================
  // UPDATE TASK STATUS
  // ==========================================================

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    const taskId = getTaskId(task);

    if (!taskId) {
      setError("Task ID is missing.");
      return;
    }

    try {
      setError("");

      const updatedTask = await taskService.updateTaskStatus(taskId, status);

      setTasks((previousTasks) =>
        previousTasks.map((currentTask) =>
          getTaskId(currentTask) === taskId ? updatedTask : currentTask,
        ),
      );
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update task status.",
      );
    }
  };

  // ==========================================================
  // CREATE TASK
  // ==========================================================

  const handleTaskCreated = (createdTask: Task) => {
    if (!createdTask) {
      return;
    }

    setTasks((previousTasks) => [createdTask, ...previousTasks]);

    setCreateOpen(false);
    setError("");
  };

  // ==========================================================
  // OPEN CREATE TASK
  // ==========================================================

  const handleOpenCreateTask = () => {
    if (!activeProjectId) {
      setError("Please select a project before creating a task.");

      return;
    }

    setCreateOpen(true);
  };

  // ==========================================================
  // OPEN EDIT TASK
  // ==========================================================

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);

    let dueDate = "";

    if (task.dueDate) {
      const date = new Date(task.dueDate);

      if (!Number.isNaN(date.getTime())) {
        dueDate = date.toISOString().slice(0, 10);
      }
    }

    setEditForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "Todo",
      priority: task.priority || "Medium",
      assignedTo:
        typeof task.assignedTo === "string"
          ? task.assignedTo
          : task.assignedTo?._id || "",
      dueDate,
    });

    setEditOpen(true);
  };

  // ==========================================================
  // EDIT FORM CHANGE
  // ==========================================================

  const handleEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // UPDATE TASK
  // ==========================================================

  const handleUpdateTask = async () => {
    if (!editingTask) {
      return;
    }

    const taskId = getTaskId(editingTask);

    if (!taskId) {
      setError("Task ID is missing.");
      return;
    }

    if (!editForm.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setEditLoading(true);
      setError("");

      const payload: UpdateTaskPayload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        status: editForm.status,
        priority: editForm.priority,
        dueDate: editForm.dueDate || undefined,
        assignedTo: editForm.assignedTo.trim() || undefined,
      };

      const updatedTask = await taskService.updateTask(taskId, payload);

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          getTaskId(task) === taskId ? updatedTask : task,
        ),
      );

      setEditOpen(false);
      setEditingTask(null);
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update task.",
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ==========================================================
  // DELETE TASK
  // ==========================================================

  const handleDeleteTask = async () => {
    if (!deleteTaskId) {
      return;
    }

    try {
      setDeleteLoading(true);
      setError("");

      await taskService.deleteTask(deleteTaskId);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => getTaskId(task) !== deleteTaskId),
      );

      setDeleteTaskId(null);
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete task.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==========================================================
  // AI PROJECT-WIDE AUTO PRIORITIZATION
  // ==========================================================

  const handleAutoPrioritize = async () => {
    /*
     * IMPORTANT:
     *
     * NEVER use a task ID here.
     *
     * This must be the project ID:
     *
     * activeProjectId
     */
    if (!activeProjectId) {
      setError("Please select a project before using AI prioritization.");

      return;
    }

    // Open dialog immediately so user gets feedback.
    setAiDialogOpen(true);

    setAiLoading(true);

    setAiMessage("Gemini is analyzing the tasks in this project...");

    setAiTasks([]);

    setAiError("");

    setError("");

    try {
      /*
       * PROJECT-WIDE CALL.
       *
       * This calls:
       *
       * PATCH /api/tasks/:projectId/ai-prioritize
       *
       * The argument MUST be activeProjectId.
       */
      const result =
        await taskService.autoPrioritizeProjectTasks(activeProjectId);

      /*
       * Your service already converts the backend
       * response into:
       *
       * {
       *   success,
       *   message,
       *   tasks
       * }
       *
       * Therefore DO NOT use:
       *
       * result.data
       */
      const message =
        result.message || "AI prioritization completed successfully.";

      const prioritizedTasks = Array.isArray(result.tasks) ? result.tasks : [];

      setAiMessage(message);

      setAiTasks(prioritizedTasks);

      /*
       * If backend returned tasks, immediately update
       * the Kanban board.
       */
      if (prioritizedTasks.length > 0) {
        setTasks(prioritizedTasks);
      } else {
        /*
         * Some backend implementations perform the update
         * but don't return the complete task array.
         *
         * In that case fetch the project tasks again.
         */
        try {
          const refreshedTasks = await taskService.getTasks(activeProjectId);

          setTasks(refreshedTasks);

          if (refreshedTasks.length > 0) {
            setAiTasks(refreshedTasks);
          }
        } catch {
          // Keep the successful AI message even if refresh fails.
        }
      }
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "AI prioritization failed.";

      setAiError(message);

      setAiMessage(message);

      /*
       * Also show the error on the main page.
       */
      setError(message);
    } finally {
      setAiLoading(false);
    }
  };

  // ==========================================================
  // CLOSE AI DIALOG
  // ==========================================================

  const handleCloseAiDialog = () => {
    if (aiLoading) {
      return;
    }

    setAiDialogOpen(false);
  };

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry = async () => {
    setError("");

    if (projects.length === 0) {
      await loadProjects();
    }

    await loadTasks();
  };

  // ==========================================================
  // AI TASK DISPLAY
  // ==========================================================

  const getAiPriorityTasks = () => {
    return [...aiTasks].sort((a, b) => {
      const order: Record<string, number> = {
        Critical: 1,
        High: 2,
        Medium: 3,
        Low: 4,
      };

      return (order[a.priority] || 99) - (order[b.priority] || 99);
    });
  };

  // ==========================================================
  // TASK CARD
  // ==========================================================

  const renderTaskCard = (task: Task) => {
    const taskId = getTaskId(task);

    return (
      <Card
        key={taskId}
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2.5,
          mb: 1.5,
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          },
        }}
      >
        <CardContent
          sx={{
            p: 2,
            "&:last-child": {
              pb: 2,
            },
          }}
        >
          <Stack spacing={1.5}>
            {/* TITLE + ACTIONS */}

            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={1}
            >
              <Typography
                fontWeight={700}
                sx={{
                  wordBreak: "break-word",
                  flex: 1,
                }}
              >
                {task.title || "Untitled Task"}
              </Typography>

              <Stack direction="row" spacing={0.25}>
                <Tooltip title="Edit task">
                  <Button
                    size="small"
                    onClick={() => handleOpenEdit(task)}
                    sx={{
                      minWidth: 0,
                      p: 0.5,
                    }}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </Button>
                </Tooltip>

                <Tooltip title="Delete task">
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setDeleteTaskId(taskId)}
                    sx={{
                      minWidth: 0,
                      p: 0.5,
                    }}
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>

            {/* DESCRIPTION */}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: 40,
              }}
            >
              {task.description || "No description available."}
            </Typography>

            {/* PRIORITY */}

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Typography variant="caption" color="text.secondary">
                Priority
              </Typography>

              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  px: 1,
                  py: 0.4,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                }}
              >
                {task.priority}
              </Typography>
            </Stack>

            {/* DUE DATE */}

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="caption" color="text.secondary">
                Due date
              </Typography>

              <Typography
                variant="caption"
                fontWeight={600}
                color={task.overdue ? "error.main" : "text.primary"}
              >
                {task.overdue ? "Overdue • " : ""}
                {formatDate(task.dueDate)}
              </Typography>
            </Stack>

            {/* ASSIGNEE */}

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="caption" color="text.secondary">
                Assigned to
              </Typography>

              <Typography
                variant="caption"
                fontWeight={600}
                sx={{
                  maxWidth: "60%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {getAssigneeName(task)}
              </Typography>
            </Stack>

            {/* STATUS */}

            <FormControl size="small" fullWidth>
              <Select
                value={task.status}
                onChange={(event) =>
                  void handleStatusChange(
                    task,
                    event.target.value as TaskStatus,
                  )
                }
                sx={{
                  borderRadius: 1.5,
                  fontSize: 13,
                }}
              >
                <MenuItem value="Todo">To Do</MenuItem>

                <MenuItem value="In Progress">In Progress</MenuItem>

                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // ==========================================================
  // KANBAN COLUMN
  // ==========================================================

  const renderColumn = (title: string, tasksForColumn: Task[]) => {
    return (
      <Box
        sx={{
          minWidth: 0,
          bgcolor: "background.default",
          borderRadius: 2.5,
          p: 1.5,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: 1.5,
          }}
        >
          <Typography fontWeight={700}>{title}</Typography>

          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              minWidth: 26,
              height: 26,
              px: 0.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1.5,
              bgcolor: "action.hover",
            }}
          >
            {tasksForColumn.length}
          </Typography>
        </Stack>

        {tasksForColumn.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No tasks
            </Typography>
          </Box>
        ) : (
          tasksForColumn.map(renderTaskCard)
        )}
      </Box>
    );
  };

  // ==========================================================
  // PROJECT LOADING SCREEN
  // ==========================================================

  if (projectsLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">Loading projects...</Typography>
        </Stack>
      </Box>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: "1.8rem",
                sm: "2.2rem",
                md: "2.4rem",
              },
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Tasks
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage and track tasks for your project
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
        >
          {/* =================================================
              AI PRIORITIZE
          ================================================= */}

          <Tooltip
            title={
              activeProjectId
                ? "Use AI to prioritize all tasks in this project"
                : "Select a project first"
            }
          >
            <span>
              <Button
                variant="outlined"
                startIcon={
                  aiLoading ? (
                    <CircularProgress size={18} />
                  ) : (
                    <AutoAwesomeRoundedIcon />
                  )
                }
                onClick={() => void handleAutoPrioritize()}
                disabled={!activeProjectId || aiLoading || tasks.length === 0}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {aiLoading ? "Prioritizing..." : "AI Prioritize"}
              </Button>
            </span>
          </Tooltip>

          {/* NEW TASK */}

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreateTask}
            disabled={!activeProjectId}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
            }}
          >
            New Task
          </Button>
        </Stack>
      </Stack>

      {/* =====================================================
          PROJECT SELECTOR
      ===================================================== */}

      {projects.length > 0 && (
        <Card
          elevation={0}
          sx={{
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              alignItems={{
                xs: "stretch",
                sm: "center",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <FolderRoundedIcon color="primary" />

                <Typography fontWeight={700}>Project</Typography>
              </Stack>

              <FormControl
                size="small"
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 300,
                  },
                }}
              >
                <InputLabel>Select Project</InputLabel>

                <Select
                  value={activeProjectId}
                  label="Select Project"
                  onChange={(event) => handleProjectChange(event.target.value)}
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedProject && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedProject.description ||
                    "Manage tasks for this project"}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* =====================================================
          PROJECT ERROR
      ===================================================== */}

      {projectsError && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void loadProjects()}
            >
              Retry
            </Button>
          }
        >
          {projectsError}
        </Alert>
      )}

      {/* =====================================================
          NO PROJECTS
      ===================================================== */}

      {!projectsLoading && projects.length === 0 && !projectsError && (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            mb: 3,
          }}
        >
          <CardContent
            sx={{
              minHeight: 350,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <FolderRoundedIcon
              sx={{
                fontSize: 60,
                color: "text.secondary",
                mb: 1.5,
              }}
            />

            <Typography variant="h6" fontWeight={700}>
              No projects available
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
                mb: 2,
              }}
            >
              Create a project before creating tasks.
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/projects")}
              sx={{
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Go to Projects
            </Button>
          </CardContent>
        </Card>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      {activeProjectId && projects.length > 0 && (
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
          sx={{
            mb: 3,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              maxWidth: {
                xs: "100%",
                sm: 360,
              },
            }}
            InputProps={{
              startAdornment: (
                <SearchRoundedIcon
                  fontSize="small"
                  sx={{
                    mr: 1,
                    color: "text.secondary",
                  }}
                />
              ),
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: 150,
            }}
          >
            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "ALL" | TaskStatus)
              }
            >
              <MenuItem value="ALL">All Statuses</MenuItem>

              <MenuItem value="Todo">To Do</MenuItem>

              <MenuItem value="In Progress">In Progress</MenuItem>

              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 150,
            }}
          >
            <Select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value as "ALL" | TaskPriority)
              }
            >
              <MenuItem value="ALL">All Priorities</MenuItem>

              <MenuItem value="Low">Low</MenuItem>

              <MenuItem value="Medium">Medium</MenuItem>

              <MenuItem value="High">High</MenuItem>

              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void loadTasks()}
            sx={{
              minWidth: 110,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Refresh
          </Button>
        </Stack>
      )}

      {/* =====================================================
          TASK ERROR
      ===================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void handleRetry()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* =====================================================
          LOADING TASKS
      ===================================================== */}

      {loading && activeProjectId ? (
        <Box
          sx={{
            minHeight: 350,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />

            <Typography color="text.secondary">Loading tasks...</Typography>
          </Stack>
        </Box>
      ) : activeProjectId &&
        projects.length > 0 &&
        filteredTasks.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <CardContent
            sx={{
              minHeight: 350,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <AssignmentRoundedIcon
              sx={{
                fontSize: 60,
                color: "text.secondary",
                mb: 1.5,
              }}
            />

            <Typography variant="h6" fontWeight={700}>
              No tasks available
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {search || statusFilter !== "ALL" || priorityFilter !== "ALL"
                ? "No tasks match your current filters."
                : "Create a task to get started."}
            </Typography>

            {!search && statusFilter === "ALL" && priorityFilter === "ALL" && (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={handleOpenCreateTask}
                sx={{
                  mt: 2,
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Create Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        activeProjectId &&
        projects.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
              alignItems: "start",
            }}
          >
            {renderColumn(getStatusLabel("Todo"), todoTasks)}

            {renderColumn(getStatusLabel("In Progress"), inProgressTasks)}

            {renderColumn(getStatusLabel("Completed"), completedTasks)}
          </Box>
        )
      )}

      {/* =====================================================
          CREATE TASK DIALOG
      ===================================================== */}

      {activeProjectId && (
        <CreateTaskDialog
          open={createOpen}
          projectId={activeProjectId}
          onClose={() => setCreateOpen(false)}
          onCreated={(task) => handleTaskCreated(task as Task)}
        />
      )}

      {/* =====================================================
          AI PRIORITIZATION DIALOG
      ===================================================== */}

      <Dialog
        open={aiDialogOpen}
        onClose={handleCloseAiDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 700,
          }}
        >
          <AutoAwesomeRoundedIcon color="primary" />
          AI Task Prioritization
        </DialogTitle>

        <Divider />

        <DialogContent
          sx={{
            pt: 3,
          }}
        >
          {/* LOADING */}

          {aiLoading && (
            <Stack
              alignItems="center"
              spacing={2}
              sx={{
                py: 4,
              }}
            >
              <CircularProgress />

              <Typography fontWeight={600}>
                Gemini is analyzing your project tasks...
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                The AI is considering due dates, status, workload, urgency, and
                task details.
              </Typography>
            </Stack>
          )}

          {/* RESULT */}

          {!aiLoading && (
            <Stack spacing={2}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: aiError ? "error.light" : "divider",
                  borderRadius: 3,
                  bgcolor: aiError ? "error.50" : "background.default",
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    {aiError ? (
                      <WarningRoundedIcon
                        color="error"
                        sx={{
                          mt: 0.2,
                        }}
                      />
                    ) : (
                      <CheckCircleRoundedIcon
                        color="success"
                        sx={{
                          mt: 0.2,
                        }}
                      />
                    )}

                    <Box>
                      <Typography
                        fontWeight={700}
                        sx={{
                          mb: 0.5,
                        }}
                      >
                        Gemini Result
                      </Typography>

                      <Typography
                        color={aiError ? "error.main" : "text.secondary"}
                        sx={{
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {aiMessage || "AI prioritization completed."}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* PRIORITIZED TASKS */}

              {getAiPriorityTasks().length > 0 && (
                <Box>
                  <Typography
                    fontWeight={700}
                    sx={{
                      mb: 1.5,
                    }}
                  >
                    Prioritized Tasks
                  </Typography>

                  <Stack spacing={1}>
                    {getAiPriorityTasks().map((task, index) => (
                      <Card
                        key={getTaskId(task)}
                        elevation={0}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <CardContent
                          sx={{
                            py: 1.5,
                            "&:last-child": {
                              pb: 1.5,
                            },
                          }}
                        >
                          <Stack
                            direction={{
                              xs: "column",
                              sm: "row",
                            }}
                            alignItems={{
                              xs: "flex-start",
                              sm: "center",
                            }}
                            justifyContent="space-between"
                            spacing={1.5}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{
                                  minWidth: 24,
                                }}
                              >
                                {index + 1}.
                              </Typography>

                              <Box>
                                <Typography fontWeight={700}>
                                  {task.title || "Untitled Task"}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {task.overdue
                                    ? "Overdue"
                                    : task.dueDate
                                      ? `Due ${formatDate(task.dueDate)}`
                                      : "No due date"}
                                </Typography>
                              </Box>
                            </Stack>

                            <Typography
                              variant="caption"
                              fontWeight={700}
                              sx={{
                                px: 1.5,
                                py: 0.6,
                                borderRadius: 2,
                                bgcolor: "action.hover",
                              }}
                            >
                              {task.priority}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* NO TASKS RETURNED */}

              {getAiPriorityTasks().length === 0 && !aiError && (
                <Typography variant="body2" color="text.secondary">
                  The AI completed the prioritization, but the backend did not
                  return a task list. Refresh the tasks to see the latest
                  priorities.
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          {!aiLoading && aiError && (
            <Button
              onClick={() => void handleAutoPrioritize()}
              variant="outlined"
              sx={{
                textTransform: "none",
              }}
            >
              Retry
            </Button>
          )}

          <Button
            onClick={handleCloseAiDialog}
            disabled={aiLoading}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          EDIT TASK DIALOG
      ===================================================== */}

      <Dialog
        open={editOpen}
        onClose={() => {
          if (!editLoading) {
            setEditOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Task</DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{
              mt: 1,
            }}
          >
            <TextField
              label="Task Title"
              fullWidth
              required
              value={editForm.title}
              onChange={(event) =>
                handleEditChange("title", event.target.value)
              }
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={editForm.description}
              onChange={(event) =>
                handleEditChange("description", event.target.value)
              }
            />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>

                <Select
                  value={editForm.status}
                  label="Status"
                  onChange={(event) =>
                    handleEditChange("status", event.target.value)
                  }
                >
                  <MenuItem value="Todo">To Do</MenuItem>

                  <MenuItem value="In Progress">In Progress</MenuItem>

                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>

                <Select
                  value={editForm.priority}
                  label="Priority"
                  onChange={(event) =>
                    handleEditChange("priority", event.target.value)
                  }
                >
                  <MenuItem value="Low">Low</MenuItem>

                  <MenuItem value="Medium">Medium</MenuItem>

                  <MenuItem value="High">High</MenuItem>

                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Assigned User ID"
              fullWidth
              value={editForm.assignedTo}
              onChange={(event) =>
                handleEditChange("assignedTo", event.target.value)
              }
              helperText="Enter the MongoDB User ID. Leave empty to unassign."
            />

            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={editForm.dueDate}
              onChange={(event) =>
                handleEditChange("dueDate", event.target.value)
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={editLoading}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() => void handleUpdateTask()}
            disabled={editLoading}
          >
            {editLoading ? <CircularProgress size={20} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          DELETE CONFIRMATION DIALOG
      ===================================================== */}

      <Dialog
        open={Boolean(deleteTaskId)}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteTaskId(null);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Task?</DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete this task? This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDeleteTaskId(null)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeleteTask()}
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
