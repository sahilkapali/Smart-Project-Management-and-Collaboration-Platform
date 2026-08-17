import {
  useCallback,
  useEffect,
  useMemo,
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
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import {
  useNavigate,
} from "react-router-dom";

import taskService from "../../services/task.service";
import projectService from "../../services/project.service";

import type {
  Task,
} from "../../types/task.types";

import type {
  Project,
} from "../../types/project.types";


const Tasks = () => {

  const navigate =
    useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [projectFilter, setProjectFilter] =
    useState("ALL");

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);


  // ==========================================================
  // GET ID FROM OBJECT
  // ==========================================================

  const getId = (
    value: any,
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
      value.$oid
    ) {
      return String(
        value.$oid,
      );
    }


    if (
      typeof value === "object" &&
      value._id
    ) {
      return getId(
        value._id,
      );
    }


    if (
      typeof value === "object" &&
      value.id
    ) {
      return getId(
        value.id,
      );
    }


    return "";
  };


  // ==========================================================
  // GET PROJECT ID
  // ==========================================================

  const getProjectId = (
    project: Project,
  ): string => {

    const value =
      project as any;


    return (
      getId(value.id) ||
      getId(value._id) ||
      getId(
        value.projectId,
      )
    );
  };


  // ==========================================================
  // GET TASK ID
  // ==========================================================

  const getTaskId = (
    task: Task,
  ): string => {

    const value =
      task as any;


    return (
      getId(value.id) ||
      getId(value._id) ||
      getId(
        value.taskId,
      )
    );
  };


  // ==========================================================
  // GET TASK PROJECT ID
  // ==========================================================

  const getTaskProjectId = (
    task: Task,
  ): string => {

    const value =
      task as any;


    /*
     * Different versions of the backend may return
     * the project reference as:
     *
     * projectId
     * project
     * project._id
     * project.id
     */

    return (
      getId(
        value.projectId,
      ) ||
      getId(
        value.project,
      ) ||
      getId(
        value.project?._id,
      ) ||
      getId(
        value.project?.id,
      )
    );
  };


  // ==========================================================
  // LOAD TASKS
  // ==========================================================

  const loadTasks =
    useCallback(async () => {

      try {

        setLoading(true);
        setError("");


        /*
         * ------------------------------------------------------
         * FIRST GET ONLY PROJECTS ACCESSIBLE TO CURRENT USER
         * ------------------------------------------------------
         */

        const projectResult =
          await projectService.getProjects();


        const accessibleProjects =
          Array.isArray(
            projectResult,
          )
            ? projectResult
            : [];


        setProjects(
          accessibleProjects,
        );


        /*
         * ------------------------------------------------------
         * LOAD TASKS PROJECT BY PROJECT
         *
         * This prevents us from blindly requesting tasks for
         * projects the current user cannot access.
         * ------------------------------------------------------
         */

        const taskResults =
          await Promise.all(
            accessibleProjects.map(
              async (
                project,
              ) => {

                const projectId =
                  getProjectId(
                    project,
                  );


                if (!projectId) {
                  return [];
                }


                try {

                  const result =
                    await taskService.getTasks(
                      projectId,
                    );


                  return Array.isArray(
                    result,
                  )
                    ? result
                    : [];

                } catch (
                  projectError: any
                ) {

                  /*
                   * ------------------------------------------------
                   * 403 IS EXPECTED WHEN THE USER DOES NOT HAVE
                   * ACCESS TO A PARTICULAR PROJECT.
                   *
                   * Do not stop loading the other projects.
                   * ------------------------------------------------
                   */

                  if (
                    projectError
                      ?.response
                      ?.status === 403
                  ) {

                    console.warn(
                      `Access denied for project ${projectId}`,
                    );

                    return [];
                  }


                  console.error(
                    `Unable to load tasks for project ${projectId}`,
                    projectError,
                  );


                  return [];
                }

              },
            ),
          );


        /*
         * ------------------------------------------------------
         * COMBINE TASKS FROM ACCESSIBLE PROJECTS
         * ------------------------------------------------------
         */

        const allTasks =
          taskResults.flat();


        /*
         * ------------------------------------------------------
         * REMOVE DUPLICATES
         * ------------------------------------------------------
         */

        const uniqueTasks =
          new Map<
            string,
            Task
          >();


        allTasks.forEach(
          (
            task,
            index,
          ) => {

            const taskId =
              getTaskId(
                task,
              );


            if (taskId) {

              uniqueTasks.set(
                taskId,
                task,
              );

            } else {

              uniqueTasks.set(
                `task-${index}`,
                task,
              );

            }

          },
        );


        setTasks(
          Array.from(
            uniqueTasks.values(),
          ),
        );

      } catch (
        err: any
      ) {

        console.error(
          "Failed to load tasks:",
          err,
        );


        if (
          err?.response?.status ===
          403
        ) {

          setError(
            "You do not have permission to view these tasks.",
          );

        } else {

          setError(
            err?.response?.data
              ?.message ||
            "Unable to load tasks.",
          );

        }

      } finally {

        setLoading(false);

      }

    }, []);


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadTasks();

  }, [
    loadTasks,
  ]);


  // ==========================================================
  // FIND PROJECT
  // ==========================================================

  const getProjectForTask = (
    task: Task,
  ): Project | undefined => {

    const taskProjectId =
      getTaskProjectId(
        task,
      );


    if (!taskProjectId) {
      return undefined;
    }


    return projects.find(
      (
        project,
      ) =>
        getProjectId(
          project,
        ) ===
        taskProjectId,
    );
  };


  // ==========================================================
  // FILTER TASKS
  // ==========================================================

  const filteredTasks =
    useMemo(() => {

      return tasks.filter(
        (
          task,
        ) => {

          const value =
            task as any;


          const title =
            String(
              value.title ||
              value.name ||
              "",
            );


          const description =
            String(
              value.description ||
              "",
            );


          const taskProjectId =
            getTaskProjectId(
              task,
            );


          const matchesSearch =
            !search.trim() ||
            title
              .toLowerCase()
              .includes(
                search
                  .trim()
                  .toLowerCase(),
              ) ||
            description
              .toLowerCase()
              .includes(
                search
                  .trim()
                  .toLowerCase(),
              );


          const matchesStatus =
            statusFilter ===
              "ALL" ||
            String(
              value.status ||
              "",
            ) ===
              statusFilter;


          const matchesProject =
            projectFilter ===
              "ALL" ||
            taskProjectId ===
              projectFilter;


          return (
            matchesSearch &&
            matchesStatus &&
            matchesProject
          );

        },
      );

    }, [
      tasks,
      search,
      statusFilter,
      projectFilter,
    ]);


  // ==========================================================
  // STATUS FORMAT
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
        (
          letter,
        ) =>
          letter.toUpperCase(),
      );

  };


  // ==========================================================
  // OPEN PROJECT
  // ==========================================================

  const handleOpenProject = (
    task: Task,
  ) => {

    const projectId =
      getTaskProjectId(
        task,
      );


    if (!projectId) {

      setError(
        "Project ID is missing for this task.",
      );

      return;
    }


    navigate(
      `/projects/${projectId}`,
    );

  };


  // ==========================================================
  // EDIT TASK
  // ==========================================================

  const handleEdit = (
    task: Task,
  ) => {

    setSelectedTask(
      task,
    );

    setEditOpen(
      true,
    );

  };


  // ==========================================================
  // DELETE TASK
  // ==========================================================

  const handleDelete = (
    task: Task,
  ) => {

    setSelectedTask(
      task,
    );

    setDeleteOpen(
      true,
    );

  };


  // ==========================================================
  // CONFIRM DELETE
  // ==========================================================

  const handleDeleteConfirm =
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

        await taskService.deleteTask(
          taskId,
        );


        setDeleteOpen(
          false,
        );


        setSelectedTask(
          null,
        );


        await loadTasks();

      } catch (
        err: any
      ) {

        console.error(
          "Failed to delete task:",
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


        setDeleteOpen(
          false,
        );

      }

    };


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

      {/* ======================================================
          HEADER
      ====================================================== */}

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
        sx={{
          mb: 3,
        }}
      >

        <Box>

          <Typography
            variant="h4"
            fontWeight={800}
          >
            Tasks
          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage tasks from
            projects you have
            access to.
          </Typography>

        </Box>


        <Button
          variant="contained"
          startIcon={
            <AddRoundedIcon />
          }
          onClick={() =>
            setCreateOpen(
              true,
            )
          }
          sx={{
            textTransform:
              "none",

            fontWeight:
              700,

            borderRadius:
              2,
          }}
        >
          New Task
        </Button>

      </Stack>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>

      )}


      {/* ======================================================
          SEARCH + FILTERS
      ====================================================== */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >

        <TextField
          fullWidth
          size="small"
          placeholder="Search tasks..."
          value={search}
          onChange={(
            event,
          ) =>
            setSearch(
              event.target.value,
            )
          }
          InputProps={{
            startAdornment: (
              <SearchRoundedIcon
                sx={{
                  mr: 1,
                  color:
                    "text.secondary",
                }}
              />
            ),
          }}
        />


        <Select
          size="small"
          value={
            statusFilter
          }
          onChange={(
            event,
          ) =>
            setStatusFilter(
              event.target.value,
            )
          }
          sx={{
            minWidth: 180,
          }}
        >

          <MenuItem value="ALL">
            All Statuses
          </MenuItem>

          <MenuItem value="TODO">
            To Do
          </MenuItem>

          <MenuItem value="PENDING">
            Pending
          </MenuItem>

          <MenuItem value="IN_PROGRESS">
            In Progress
          </MenuItem>

          <MenuItem value="COMPLETED">
            Completed
          </MenuItem>

          <MenuItem value="DONE">
            Done
          </MenuItem>

        </Select>


        <Select
          size="small"
          value={
            projectFilter
          }
          onChange={(
            event,
          ) =>
            setProjectFilter(
              event.target.value,
            )
          }
          sx={{
            minWidth: 220,
          }}
        >

          <MenuItem value="ALL">
            All Projects
          </MenuItem>


          {projects.map(
            (
              project,
              index,
            ) => {

              const projectId =
                getProjectId(
                  project,
                );


              return (

                <MenuItem
                  key={
                    projectId ||
                    `project-${index}`
                  }
                  value={
                    projectId
                  }
                >
                  {project.name ||
                    "Untitled Project"}
                </MenuItem>

              );

            },
          )}

        </Select>

      </Stack>


      {/* ======================================================
          EMPTY
      ====================================================== */}

      {filteredTasks.length ===
        0 ? (

        <Card
          elevation={0}
          sx={{
            border:
              "1px solid",
            borderColor:
              "divider",
            borderRadius:
              3,
          }}
        >

          <CardContent
            sx={{
              minHeight:
                280,

              display:
                "flex",

              flexDirection:
                "column",

              alignItems:
                "center",

              justifyContent:
                "center",

              textAlign:
                "center",
            }}
          >

            <Typography
              variant="h6"
              fontWeight={700}
            >
              No tasks found
            </Typography>


            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              There are no tasks
              matching your current
              filters.
            </Typography>

          </CardContent>

        </Card>

      ) : (

        /* ====================================================
           TASK LIST
        ==================================================== */

        <Box
          sx={{
            display:
              "grid",

            gridTemplateColumns:
              {
                xs: "1fr",

                sm:
                  "repeat(2, 1fr)",

                lg:
                  "repeat(3, 1fr)",
              },

            gap: 2,
          }}
        >

          {filteredTasks.map(
            (
              task,
              index,
            ) => {

              const value =
                task as any;


              const taskId =
                getTaskId(
                  task,
                );


              const project =
                getProjectForTask(
                  task,
                );


              const title =
                value.title ||
                value.name ||
                "Untitled Task";


              const description =
                value.description ||
                "No description available.";


              const status =
                value.status ||
                "UNKNOWN";


              return (

                <Card
                  key={
                    taskId ||
                    `task-${index}`
                  }
                  elevation={0}
                  sx={{
                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    borderRadius:
                      3,

                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease",

                    "&:hover": {
                      transform:
                        "translateY(-3px)",

                      boxShadow:
                        "0 10px 25px rgba(0,0,0,0.12)",
                    },
                  }}
                >

                  <CardContent>

                    {/* TASK HEADER */}

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                    >

                      <Box
                        sx={{
                          minWidth:
                            0,
                        }}
                      >

                        <Typography
                          fontWeight={700}
                          fontSize={17}
                          sx={{
                            wordBreak:
                              "break-word",
                          }}
                        >
                          {title}
                        </Typography>


                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.7,

                            display:
                              "-webkit-box",

                            WebkitLineClamp:
                              3,

                            WebkitBoxOrient:
                              "vertical",

                            overflow:
                              "hidden",
                          }}
                        >
                          {description}
                        </Typography>

                      </Box>


                      <IconButton
                        size="small"
                        onClick={() =>
                          handleEdit(
                            task,
                          )
                        }
                      >
                        <MoreVertRoundedIcon />
                      </IconButton>

                    </Stack>


                    {/* STATUS */}

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        mt: 2,
                      }}
                    >

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Status
                      </Typography>


                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        {formatStatus(
                          status,
                        )}
                      </Typography>

                    </Stack>


                    {/* PROJECT */}

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        mt: 1,
                      }}
                    >

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Project
                      </Typography>


                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          maxWidth:
                            "60%",

                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {project?.name ||
                          "Unknown Project"}
                      </Typography>

                    </Stack>


                    {/* OPEN PROJECT */}

                    {project && (

                      <Button
                        size="small"
                        onClick={() =>
                          handleOpenProject(
                            task,
                          )
                        }
                        sx={{
                          mt: 2,

                          textTransform:
                            "none",

                          fontWeight:
                            600,
                        }}
                      >
                        View Project
                      </Button>

                    )}


                    {/* EDIT / DELETE */}

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        mt: 1,
                      }}
                    >

                      <Button
                        size="small"
                        startIcon={
                          <EditRoundedIcon />
                        }
                        onClick={() =>
                          handleEdit(
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
                        startIcon={
                          <DeleteRoundedIcon />
                        }
                        onClick={() =>
                          handleDelete(
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

                    </Stack>

                  </CardContent>

                </Card>

              );

            },
          )}

        </Box>

      )}


      {/* ======================================================
          DELETE DIALOG
      ====================================================== */}

      <Dialog
        open={
          deleteOpen
        }
        onClose={() =>
          setDeleteOpen(
            false,
          )
        }
      >

        <DialogTitle
          fontWeight={700}
        >
          Delete Task?
        </DialogTitle>


        <DialogContent>

          <Typography>
            Are you sure you want
            to delete{" "}

            <strong>
              {
                (selectedTask as any)
                  ?.title ||
                (selectedTask as any)
                  ?.name ||
                "this task"
              }
            </strong>
            ?
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
              handleDeleteConfirm
            }
            sx={{
              textTransform:
                "none",
            }}
          >
            Delete
          </Button>

        </DialogActions>

      </Dialog>


      {/* ======================================================
          CREATE TASK
          
          IMPORTANT:
          Keep your existing CreateTask dialog/component here
          if your current project already has one.
      ====================================================== */}

      {createOpen && (

        <Dialog
          open={
            createOpen
          }
          onClose={() =>
            setCreateOpen(
              false,
            )
          }
          fullWidth
          maxWidth="sm"
        >

          <DialogTitle
            fontWeight={700}
          >
            Create Task
          </DialogTitle>


          <DialogContent>

            <Typography
              color="text.secondary"
              sx={{
                py: 2,
              }}
            >
              Use your existing task
              creation form/component
              here.
            </Typography>

          </DialogContent>


          <DialogActions>

            <Button
              onClick={() =>
                setCreateOpen(
                  false,
                )
              }
              sx={{
                textTransform:
                  "none",
              }}
            >
              Close
            </Button>

          </DialogActions>

        </Dialog>

      )}


      {/* ======================================================
          EDIT TASK
          
          IMPORTANT:
          Existing edit functionality can be connected to
          your existing EditTask component.
      ====================================================== */}

      {editOpen && (

        <Dialog
          open={
            editOpen
          }
          onClose={() =>
            setEditOpen(
              false,
            )
          }
          fullWidth
          maxWidth="sm"
        >

          <DialogTitle
            fontWeight={700}
          >
            Edit Task
          </DialogTitle>


          <DialogContent>

            <Typography
              color="text.secondary"
              sx={{
                py: 2,
              }}
            >
              Use your existing task
              editing form/component
              here.
            </Typography>

          </DialogContent>


          <DialogActions>

            <Button
              onClick={() =>
                setEditOpen(
                  false,
                )
              }
              sx={{
                textTransform:
                  "none",
              }}
            >
              Close
            </Button>

          </DialogActions>

        </Dialog>

      )}

    </Box>

  );
};


export default Tasks;