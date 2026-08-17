import {
  useCallback,
  useEffect,
  useState,
} from "react";

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
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import projectService from "../../services/project.service";
import taskService from "../../services/task.service";

import type {
  Project,
} from "../../types/project.types";

import type {
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskPayload,
} from "../../types/task.types";


const ProjectDetails = () => {
  const navigate = useNavigate();

  const { projectId } = useParams<{
    projectId: string;
  }>();


  // ==========================================================
  // PROJECT STATE
  // ==========================================================

  const [project, setProject] =
    useState<Project | null>(null);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================================
  // EDIT TASK STATE
  // ==========================================================

  const [editOpen, setEditOpen] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [savingTask, setSavingTask] =
    useState(false);


  // ==========================================================
  // DELETE TASK STATE
  // ==========================================================

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [deletingTask, setDeletingTask] =
    useState(false);


  // ==========================================================
  // AI PRIORITIZATION STATE
  // ==========================================================

  const [prioritizingTaskId, setPrioritizingTaskId] =
    useState("");

  const [aiResult, setAiResult] =
    useState("");


  // ==========================================================
  // EDIT FORM
  // ==========================================================

  const [editForm, setEditForm] =
    useState<{
      title: string;
      description: string;
      priority: TaskPriority;
      status: TaskStatus;
      dueDate: string;
    }>({
      title: "",
      description: "",
      priority: "Medium",
      status: "Todo",
      dueDate: "",
    });


  // ==========================================================
  // NORMALIZE ID
  // ==========================================================

  const normalizeId = (
    value: unknown,
  ): string => {
    if (!value) {
      return "";
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return String(value);
    }

    if (
      typeof value === "object" &&
      value !== null
    ) {
      const objectValue =
        value as Record<string, unknown>;

      if (objectValue.$oid) {
        return String(
          objectValue.$oid,
        );
      }

      if (objectValue._id) {
        return normalizeId(
          objectValue._id,
        );
      }

      if (objectValue.id) {
        return normalizeId(
          objectValue.id,
        );
      }
    }

    return "";
  };


  // ==========================================================
  // GET TASK ID
  // ==========================================================

  const getTaskId = (
    task: Task,
  ): string => {
    const value =
      task as Task & {
        id?: unknown;
        _id?: unknown;
        taskId?: unknown;
      };

    return (
      normalizeId(value.id) ||
      normalizeId(value._id) ||
      normalizeId(value.taskId)
    );
  };


  // ==========================================================
  // LOAD PROJECT AND TASKS
  // ==========================================================

  const loadProject =
    useCallback(async () => {
      if (!projectId) {
        setError(
          "Project ID is missing.",
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        setError("");

        setSuccess("");


        // ====================================================
        // LOAD PROJECT
        // ====================================================

        const projectResponse =
          await projectService.getProjectById(
            projectId,
          );

        /*
         * getProjectById() already returns the
         * Project object.
         *
         * Do NOT use project.data here.
         */

        const projectData =
          projectResponse;

        if (!projectData) {
          setError(
            "Project was not found.",
          );

          setProject(null);

          return;
        }

        setProject(
          projectData,
        );


        // ====================================================
        // LOAD TASKS
        // ====================================================

        try {
          const taskResponse =
            await taskService.getTasks(
              projectId,
            );

          setTasks(
            Array.isArray(
              taskResponse,
            )
              ? taskResponse
              : [],
          );
        } catch (
          taskError: any
        ) {
          console.error(
            "Unable to load tasks:",
            taskError,
          );

          if (
            taskError?.response?.status ===
            403
          ) {
            setError(
              "You do not have permission to view the tasks in this project.",
            );
          } else {
            setError(
              taskError?.response?.data
                ?.message ||
                "Unable to load project tasks.",
            );
          }

          setTasks([]);
        }
      } catch (
        err: any
      ) {
        console.error(
          "Unable to load project:",
          err,
        );

        if (
          err?.response?.status ===
          403
        ) {
          setError(
            "You do not have permission to view this project.",
          );
        } else if (
          err?.response?.status ===
          404
        ) {
          setError(
            "Project was not found.",
          );
        } else {
          setError(
            err?.response?.data
              ?.message ||
              "Unable to load project.",
          );
        }

        setProject(null);
      } finally {
        setLoading(false);
      }
    }, [
      projectId,
    ]);


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadProject();
  }, [
    loadProject,
  ]);


  // ==========================================================
  // OPEN EDIT DIALOG
  // ==========================================================

  const handleOpenEdit = (
    task: Task,
  ) => {
    setSelectedTask(
      task,
    );

    setEditForm({
      title:
        task.title || "",

      description:
        task.description || "",

      priority:
        task.priority || "Medium",

      status:
        task.status || "Todo",

      dueDate:
        task.dueDate
          ? task.dueDate.substring(
              0,
              10,
            )
          : "",
    });

    setError("");

    setSuccess("");

    setEditOpen(true);
  };


  // ==========================================================
  // CLOSE EDIT DIALOG
  // ==========================================================

  const handleCloseEdit = () => {
    if (savingTask) {
      return;
    }

    setEditOpen(false);

    setSelectedTask(null);
  };


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleFormChange = (
    field:
      | "title"
      | "description"
      | "priority"
      | "status"
      | "dueDate",
    value: string,
  ) => {
    setEditForm(
      (previous) => ({
        ...previous,
        [field]: value,
      }),
    );
  };


  // ==========================================================
  // SAVE TASK
  // ==========================================================

  const handleSaveTask =
    async () => {
      if (!selectedTask) {
        return;
      }

      const taskId =
        getTaskId(
          selectedTask,
        );

      if (!taskId) {
        setError(
          "Task ID is missing.",
        );

        return;
      }

      if (
        !editForm.title.trim()
      ) {
        setError(
          "Task title is required.",
        );

        return;
      }

      try {
        setSavingTask(true);

        setError("");

        setSuccess("");

        const updateData:
          UpdateTaskPayload = {
          title:
            editForm.title.trim(),

          description:
            editForm.description.trim(),

          priority:
            editForm.priority,

          status:
            editForm.status,

          dueDate:
            editForm.dueDate ||
            null,
        };


        const updatedTask =
          await taskService.updateTask(
            taskId,
            updateData,
          );


        // Update UI immediately
        setTasks(
          (previousTasks) =>
            previousTasks.map(
              (task) =>
                getTaskId(
                  task,
                ) === taskId
                  ? updatedTask
                  : task,
            ),
        );


        setSuccess(
          "Task updated successfully.",
        );

        setEditOpen(false);

        setSelectedTask(null);
      } catch (
        err: any
      ) {
        console.error(
          "Unable to update task:",
          err,
        );

        if (
          err?.response?.status ===
          403
        ) {
          setError(
            "You do not have permission to edit this task.",
          );
        } else {
          setError(
            err?.response?.data
              ?.message ||
              "Unable to update task.",
          );
        }
      } finally {
        setSavingTask(false);
      }
    };


  // ==========================================================
  // OPEN DELETE DIALOG
  // ==========================================================

  const handleOpenDelete = (
    task: Task,
  ) => {
    setSelectedTask(
      task,
    );

    setError("");

    setSuccess("");

    setDeleteOpen(true);
  };


  // ==========================================================
  // DELETE TASK
  // ==========================================================

  const handleDeleteTask =
    async () => {
      if (!selectedTask) {
        return;
      }

      const taskId =
        getTaskId(
          selectedTask,
        );

      if (!taskId) {
        setError(
          "Task ID is missing.",
        );

        return;
      }

      try {
        setDeletingTask(true);

        setError("");

        setSuccess("");


        await taskService.deleteTask(
          taskId,
        );


        setTasks(
          (previousTasks) =>
            previousTasks.filter(
              (task) =>
                getTaskId(
                  task,
                ) !== taskId,
            ),
        );


        setDeleteOpen(false);

        setSelectedTask(null);

        setSuccess(
          "Task deleted successfully.",
        );
      } catch (
        err: any
      ) {
        console.error(
          "Unable to delete task:",
          err,
        );

        if (
          err?.response?.status ===
          403
        ) {
          setError(
            "You do not have permission to delete this task.",
          );
        } else {
          setError(
            err?.response?.data
              ?.message ||
              "Unable to delete task.",
          );
        }
      } finally {
        setDeletingTask(false);
      }
    };


  // ==========================================================
  // AI PRIORITIZATION
  // ==========================================================

  const handleAIPrioritize =
    async (
      task: Task,
    ) => {
      const taskId =
        getTaskId(
          task,
        );

      if (!taskId) {
        setError(
          "Task ID is missing.",
        );

        return;
      }

      try {
        setPrioritizingTaskId(
          taskId,
        );

        setError("");

        setSuccess("");

        setAiResult("");


        /*
         * Existing backend endpoint:
         *
         * PATCH /api/tasks/:id/ai-prioritize
         *
         * through taskService.autoPrioritize()
         */

        const updatedTask =
          await taskService.autoPrioritize(
            taskId,
          );


        if (
          updatedTask &&
          typeof updatedTask ===
            "object"
        ) {
          setTasks(
            (previousTasks) =>
              previousTasks.map(
                (currentTask) =>
                  getTaskId(
                    currentTask,
                  ) === taskId
                    ? {
                        ...currentTask,
                        ...updatedTask,
                      }
                    : currentTask,
              ),
          );


          const newPriority =
            (
              updatedTask as
                Task & {
                  priority?: string;
                }
            ).priority;


          if (newPriority) {
            setAiResult(
              `AI assigned "${newPriority}" priority to "${task.title}".`,
            );
          } else {
            setAiResult(
              `AI prioritization completed for "${task.title}".`,
            );
          }
        } else {
          setAiResult(
            `AI prioritization completed for "${task.title}".`,
          );
        }
      } catch (
        err: any
      ) {
        console.error(
          "AI prioritization failed:",
          err,
        );

        if (
          err?.response?.status ===
          403
        ) {
          setError(
            "You do not have permission to use AI prioritization for this task.",
          );
        } else {
          setError(
            err?.response?.data
              ?.message ||
              "Unable to prioritize task using AI.",
          );
        }
      } finally {
        setPrioritizingTaskId(
          "",
        );
      }
    };


  // ==========================================================
  // FORMAT STATUS
  // ==========================================================

  const formatStatus = (
    status?: string,
  ) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll(
        "_",
        " ",
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      );
  };


  // ==========================================================
  // PROJECT ID
  // ==========================================================

  const actualProjectId =
    project
      ? (
          normalizeId(
            (project as any)
              .id,
          ) ||
          normalizeId(
            (project as any)
              ._id,
          ) ||
          normalizeId(
            (project as any)
              .projectId,
          )
        )
      : projectId;


  // ==========================================================
  // TASK COUNTS
  // ==========================================================

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "Completed",
    ).length;


  const inProgressTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "In Progress",
    ).length;


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }


  // ==========================================================
  // PROJECT NOT FOUND / ACCESS DENIED
  // ==========================================================

  if (
    error &&
    !project
  ) {
    return (
      <Box
        sx={{
          minHeight:
            "100vh",

          p: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        <Button
          startIcon={
            <ArrowBackRoundedIcon />
          }
          onClick={() =>
            navigate(
              "/projects",
            )
          }
          sx={{
            textTransform:
              "none",

            mb: 3,
          }}
        >
          Back to Projects
        </Button>


        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }


  // ==========================================================
  // PROJECT DATA
  // ==========================================================

  /*
   * IMPORTANT:
   *
   * project is already the Project object.
   *
   * Do NOT use:
   *
   * project.data
   *
   * because Project does not have a "data" property.
   */

  const projectData =
    project;


  const projectName =
    (projectData as any)?.name ||
    "Untitled Project";


  const description =
    (projectData as any)?.description ||
    "No description available.";


  const projectStatus =
    (projectData as any)?.status ||
    "UNKNOWN";


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight:
          "100vh",

        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >


      {/* ====================================================
          BACK BUTTON
      ==================================================== */}

      <Button
        startIcon={
          <ArrowBackRoundedIcon />
        }
        onClick={() =>
          navigate(
            "/projects",
          )
        }
        sx={{
          textTransform:
            "none",

          mb: 3,
        }}
      >
        Back to Projects
      </Button>


      {/* ====================================================
          ERROR MESSAGE
      ==================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError("")
          }
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}


      {/* ====================================================
          SUCCESS MESSAGE
      ==================================================== */}

      {success && (
        <Alert
          severity="success"
          onClose={() =>
            setSuccess("")
          }
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          {success}
        </Alert>
      )}


      {/* ====================================================
          AI RESULT
      ==================================================== */}

      {aiResult && (
        <Alert
          severity="info"
          icon={
            <AutoAwesomeRoundedIcon />
          }
          onClose={() =>
            setAiResult("")
          }
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          {aiResult}
        </Alert>
      )}


      {/* ====================================================
          PROJECT HEADER
      ==================================================== */}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid",

          borderColor:
            "divider",

          borderRadius: 3,

          mb: 3,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,
              md: 4,
            },
          }}
        >

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
            spacing={2}
          >

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >

              <Box
                sx={{
                  width: 54,
                  height: 54,

                  borderRadius: 2,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  bgcolor:
                    "action.hover",
                }}
              >
                <FolderRoundedIcon />
              </Box>


              <Box>

                <Typography
                  variant="h4"
                  fontWeight={800}
                >
                  {projectName}
                </Typography>


                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  {description}
                </Typography>

              </Box>

            </Stack>


            <Typography
              fontWeight={700}
            >
              {formatStatus(
                projectStatus,
              )}
            </Typography>

          </Stack>


          <Divider
            sx={{
              my: 3,
            }}
          />


          <Typography
            variant="caption"
            color="text.secondary"
          >
            Project ID
          </Typography>


          <Typography
            variant="body2"
            sx={{
              mt: 0.5,

              wordBreak:
                "break-all",
            }}
          >
            {actualProjectId}
          </Typography>

        </CardContent>
      </Card>


      {/* ====================================================
          PROJECT STATISTICS
      ==================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border:
                "1px solid",

              borderColor:
                "divider",

              borderRadius: 3,
            }}
          >
            <CardContent>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >

                <TaskAltRoundedIcon />

                <Box>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                  >
                    {tasks.length}
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Total Tasks
                  </Typography>

                </Box>

              </Stack>

            </CardContent>
          </Card>
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border:
                "1px solid",

              borderColor:
                "divider",

              borderRadius: 3,
            }}
          >
            <CardContent>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >

                <EventRoundedIcon />

                <Box>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                  >
                    {inProgressTasks}
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    In Progress
                  </Typography>

                </Box>

              </Stack>

            </CardContent>
          </Card>
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border:
                "1px solid",

              borderColor:
                "divider",

              borderRadius: 3,
            }}
          >
            <CardContent>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >

                <PeopleRoundedIcon />

                <Box>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                  >
                    {completedTasks}
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Completed
                  </Typography>

                </Box>

              </Stack>

            </CardContent>
          </Card>
        </Grid>

      </Grid>


      {/* ====================================================
          TASKS
      ==================================================== */}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid",

          borderColor:
            "divider",

          borderRadius: 3,
        }}
      >

        <CardContent
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >

          <Box
            sx={{
              mb: 3,
            }}
          >

            <Typography
              variant="h6"
              fontWeight={800}
            >
              Project Tasks
            </Typography>


            <Typography
              variant="body2"
              color="text.secondary"
            >
              Edit tasks or let AI
              automatically determine
              their priority.
            </Typography>

          </Box>


          {/* ==================================================
              NO TASKS
          ================================================== */}

          {tasks.length === 0 ? (

            <Box
              sx={{
                py: 6,

                textAlign:
                  "center",
              }}
            >

              <TaskAltRoundedIcon
                sx={{
                  fontSize: 48,

                  color:
                    "text.secondary",
                }}
              />


              <Typography
                fontWeight={700}
                sx={{
                  mt: 1,
                }}
              >
                No tasks found
              </Typography>


              <Typography
                color="text.secondary"
              >
                This project does not
                have any tasks yet.
              </Typography>

            </Box>

          ) : (

            <Stack
              spacing={2}
            >

              {tasks.map(
                (
                  task,
                  index,
                ) => {

                  const taskId =
                    getTaskId(
                      task,
                    );

                  const isPrioritizing =
                    prioritizingTaskId ===
                    taskId;


                  return (
                    <Card
                      key={
                        taskId ||
                        `task-${index}`
                      }
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                      }}
                    >

                      <CardContent>

                        {/* =================================
                            TASK HEADER
                        ================================= */}

                        <Stack
                          direction={{
                            xs: "column",
                            md: "row",
                          }}
                          justifyContent="space-between"
                          spacing={2}
                        >

                          <Box
                            sx={{
                              flex: 1,

                              minWidth: 0,
                            }}
                          >

                            <Typography
                              variant="h6"
                              fontWeight={700}
                            >
                              {task.title}
                            </Typography>


                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.7,
                              }}
                            >
                              {task.description ||
                                "No description available."}
                            </Typography>

                          </Box>


                          {/* =================================
                              TASK ACTIONS
                          ================================= */}

                          <Stack
                            direction={{
                              xs: "column",
                              sm: "row",
                            }}
                            spacing={1}
                          >

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                <EditRoundedIcon />
                              }
                              onClick={() =>
                                handleOpenEdit(
                                  task,
                                )
                              }
                              sx={{
                                textTransform:
                                  "none",
                              }}
                            >
                              Edit
                            </Button>


                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={
                                <DeleteRoundedIcon />
                              }
                              onClick={() =>
                                handleOpenDelete(
                                  task,
                                )
                              }
                              sx={{
                                textTransform:
                                  "none",
                              }}
                            >
                              Delete
                            </Button>


                            <Button
                              size="small"
                              variant="contained"
                              startIcon={
                                isPrioritizing ? (
                                  <CircularProgress
                                    size={16}
                                    color="inherit"
                                  />
                                ) : (
                                  <AutoAwesomeRoundedIcon />
                                )
                              }
                              disabled={
                                isPrioritizing
                              }
                              onClick={() =>
                                handleAIPrioritize(
                                  task,
                                )
                              }
                              sx={{
                                textTransform:
                                  "none",
                              }}
                            >
                              {isPrioritizing
                                ? "AI Thinking..."
                                : "AI Prioritize"}
                            </Button>

                          </Stack>

                        </Stack>


                        <Divider
                          sx={{
                            my: 2,
                          }}
                        />


                        {/* =================================
                            TASK INFORMATION
                        ================================= */}

                        <Grid
                          container
                          spacing={2}
                        >

                          <Grid
                            size={{
                              xs: 12,
                              sm: 4,
                            }}
                          >

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Status
                            </Typography>


                            <Typography
                              fontWeight={600}
                            >
                              {formatStatus(
                                task.status,
                              )}
                            </Typography>

                          </Grid>


                          <Grid
                            size={{
                              xs: 12,
                              sm: 4,
                            }}
                          >

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Priority
                            </Typography>


                            <Typography
                              fontWeight={700}
                            >
                              {task.priority ||
                                "Medium"}
                            </Typography>

                          </Grid>


                          <Grid
                            size={{
                              xs: 12,
                              sm: 4,
                            }}
                          >

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Due Date
                            </Typography>


                            <Typography
                              fontWeight={600}
                            >
                              {task.dueDate
                                ? new Date(
                                    task.dueDate,
                                  ).toLocaleDateString()
                                : "No due date"}
                            </Typography>

                          </Grid>

                        </Grid>

                      </CardContent>

                    </Card>
                  );
                },
              )}

            </Stack>

          )}

        </CardContent>
      </Card>


      {/* ====================================================
          PROJECT MEETINGS
      ==================================================== */}

      {actualProjectId && (
        <Button
          variant="outlined"
          startIcon={
            <EventRoundedIcon />
          }
          onClick={() =>
            navigate(
              `/projects/${actualProjectId}/meetings`,
            )
          }
          sx={{
            mt: 3,

            textTransform:
              "none",

            borderRadius: 2,

            fontWeight: 700,
          }}
        >
          Project Meetings
        </Button>
      )}


      {/* ====================================================
          EDIT TASK DIALOG
      ==================================================== */}

      <Dialog
        open={editOpen}
        onClose={
          handleCloseEdit
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          fontWeight={800}
        >
          Edit Task
        </DialogTitle>


        <DialogContent>

          <Stack
            spacing={2.5}
            sx={{
              pt: 1,
            }}
          >

            <TextField
              label="Task Title"
              value={
                editForm.title
              }
              onChange={(event) =>
                handleFormChange(
                  "title",
                  event.target.value,
                )
              }
              fullWidth
              required
            />


            <TextField
              label="Description"
              value={
                editForm.description
              }
              onChange={(event) =>
                handleFormChange(
                  "description",
                  event.target.value,
                )
              }
              fullWidth
              multiline
              minRows={4}
            />


            <TextField
              label="Due Date"
              type="date"
              value={
                editForm.dueDate
              }
              onChange={(event) =>
                handleFormChange(
                  "dueDate",
                  event.target.value,
                )
              }
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />


            <TextField
              select
              label="Priority"
              value={
                editForm.priority
              }
              onChange={(event) =>
                handleFormChange(
                  "priority",
                  event.target.value,
                )
              }
              fullWidth
            >

              <MenuItem value="Low">
                Low
              </MenuItem>

              <MenuItem value="Medium">
                Medium
              </MenuItem>

              <MenuItem value="High">
                High
              </MenuItem>

              <MenuItem value="Critical">
                Critical
              </MenuItem>

            </TextField>


            <TextField
              select
              label="Status"
              value={
                editForm.status
              }
              onChange={(event) =>
                handleFormChange(
                  "status",
                  event.target.value,
                )
              }
              fullWidth
            >

              <MenuItem value="Todo">
                Todo
              </MenuItem>

              <MenuItem value="In Progress">
                In Progress
              </MenuItem>

              <MenuItem value="Completed">
                Completed
              </MenuItem>

            </TextField>

          </Stack>

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >

          <Button
            onClick={
              handleCloseEdit
            }
            disabled={
              savingTask
            }
            sx={{
              textTransform:
                "none",
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={
              handleSaveTask
            }
            disabled={
              savingTask ||
              !editForm.title.trim()
            }
            sx={{
              textTransform:
                "none",
            }}
          >

            {savingTask ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              "Save Changes"
            )}

          </Button>

        </DialogActions>

      </Dialog>


      {/* ====================================================
          DELETE TASK DIALOG
      ==================================================== */}

      <Dialog
        open={
          deleteOpen
        }
        onClose={() => {
          if (
            !deletingTask
          ) {
            setDeleteOpen(
              false,
            );
          }
        }}
      >

        <DialogTitle
          fontWeight={800}
        >
          Delete Task?
        </DialogTitle>


        <DialogContent>

          <Typography>
            Are you sure you want
            to delete{" "}

            <strong>
              {
                selectedTask?.title ||
                "this task"
              }
            </strong>
            ?
          </Typography>


          <Typography
            color="text.secondary"
            variant="body2"
            sx={{
              mt: 1,
            }}
          >
            This action cannot be
            undone.
          </Typography>

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >

          <Button
            onClick={() =>
              setDeleteOpen(
                false,
              )
            }
            disabled={
              deletingTask
            }
            sx={{
              textTransform:
                "none",
            }}
          >
            Cancel
          </Button>


          <Button
            color="error"
            variant="contained"
            onClick={
              handleDeleteTask
            }
            disabled={
              deletingTask
            }
            sx={{
              textTransform:
                "none",
            }}
          >

            {deletingTask ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              "Delete"
            )}

          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
};


export default ProjectDetails;