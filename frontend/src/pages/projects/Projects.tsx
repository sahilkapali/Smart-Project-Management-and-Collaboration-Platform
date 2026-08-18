import { useCallback, useEffect, useState } from "react";
import type { MouseEvent } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import { useNavigate } from "react-router-dom";

import projectService from "../../services/project.service";
import type { Project } from "../../types/project.types";

import CreateProjectDialog from "./CreateProjectDialog";
import EditProjectDialog from "./EditProjectDialog";

const Projects = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string>("");

  const [search, setSearch] = useState<string>("");

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Create dialog
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  // Project menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState<boolean>(false);

  // ============================================================
  // LOAD PROJECTS
  // ============================================================

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await projectService.getProjects();

      /*
       * The service may return:
       *
       * 1. Project[]
       * 2. { data: Project[] }
       * 3. { projects: Project[] }
       */

      const responseData = response as unknown;

      let projectsData: Project[] = [];

      if (Array.isArray(responseData)) {
        projectsData = responseData;
      } else if (responseData && typeof responseData === "object") {
        const data = responseData as {
          data?: unknown;
          projects?: unknown;
        };

        if (Array.isArray(data.data)) {
          projectsData = data.data as Project[];
        } else if (Array.isArray(data.projects)) {
          projectsData = data.projects as Project[];
        }
      }

      setProjects(projectsData);
    } catch (err: unknown) {
      console.error("Loading projects failed:", err);

      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
        message?: string;
      };

      setError(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          "Unable to load projects.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // ============================================================
  // PROJECT ID HELPER
  // ============================================================

  const getProjectId = (project: Project): string => {
    return project.id || "";
  };

  // ============================================================
  // FILTER PROJECTS
  // ============================================================

  const safeProjects = Array.isArray(projects) ? projects : [];

  const filteredProjects = safeProjects.filter((project) => {
    const searchValue = search.trim().toLowerCase();

    const projectName = project.name?.toLowerCase() || "";

    const projectDescription = project.description?.toLowerCase() || "";

    const matchesSearch =
      !searchValue ||
      projectName.includes(searchValue) ||
      projectDescription.includes(searchValue);

    const matchesStatus =
      statusFilter === "ALL" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ============================================================
  // STATUS LABEL
  // ============================================================

  const getStatusLabel = (status?: string | null): string => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ============================================================
  // PROGRESS
  // ============================================================

  const getProgress = (status?: string | null): number => {
    switch (status) {
      case "COMPLETED":
        return 100;

      case "IN_PROGRESS":
        return 50;

      case "ACTIVE":
        return 75;

      case "PENDING":
        return 0;

      case "CANCELLED":
        return 0;

      default:
        return 0;
    }
  };

  // ============================================================
  // OPEN PROJECT MENU
  // ============================================================

  const handleMenuOpen = (event: MouseEvent<HTMLElement>, project: Project) => {
    event.stopPropagation();

    setAnchorEl(event.currentTarget);

    setSelectedProject(project);
  };

  // ============================================================
  // CLOSE PROJECT MENU
  // ============================================================

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /*
   * EDIT
   */
  const handleEditClick = () => {
    handleMenuClose();

    if (!selectedProject) {
      return;
    }

    const projectId = getProjectId(selectedProject);

    if (!projectId) {
      setError("Project ID is missing.");
      return;
    }

    setEditOpen(true);
  };

  /*
   * DELETE
   */
  const handleDeleteClick = () => {
    handleMenuClose();

    if (!selectedProject) {
      return;
    }

    const projectId = getProjectId(selectedProject);

    if (!projectId) {
      setError("Project ID is missing.");
      return;
    }

    setDeleteDialogOpen(true);
  };

  // ============================================================
  // CONFIRM DELETE
  // ============================================================

  const handleDeleteConfirm = async () => {
    if (!selectedProject) {
      return;
    }

    const projectId = getProjectId(selectedProject);

    if (!projectId) {
      setError("Project ID is missing.");

      setDeleteDialogOpen(false);

      return;
    }

    try {
      setError("");

      await projectService.deleteProject(projectId);

      setProjects((previousProjects) =>
        previousProjects.filter(
          (project) => getProjectId(project) !== projectId,
        ),
      );

      setDeleteDialogOpen(false);

      setSelectedProject(null);
    } catch (err: unknown) {
      console.error("Failed to delete project:", err);

      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
        message?: string;
      };

      setError(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          "Failed to delete project.",
      );

      setDeleteDialogOpen(false);
    }
  };

  // ============================================================
  // CLOSE EDIT DIALOG
  // ============================================================

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedProject(null);
  };

  // ============================================================
  // CLOSE CREATE DIALOG
  // ============================================================

  const handleCreateClose = () => {
    setCreateOpen(false);
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor:
          "background.default",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >
      {/* HEADER */}

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
              },
              fontWeight: 700,
            }}
          >
            Projects
          </Typography>

          <Typography
            color="text.secondary"
          >
            Manage and track all
            your projects
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={
            <AddRoundedIcon />
          }
          onClick={() =>
            setCreateOpen(true)
          }
          sx={{
            borderRadius: 2,
            textTransform:
              "none",
            fontWeight: 700,
            px: 2.5,
          }}
        >
          New Project
        </Button>
      </Stack>

      {/* SEARCH + FILTER */}

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
          placeholder="Search projects..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          size="small"
          sx={{
            width: {
              xs: "100%",
              sm: 480,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
        />

        <Select
          size="small"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value,
            )
          }
          sx={{
            minWidth: 190,
          }}
        >
          <MenuItem value="ALL">
            All
          </MenuItem>

          <MenuItem value="PENDING">
            Pending
          </MenuItem>

          <MenuItem value="IN_PROGRESS">
            In Progress
          </MenuItem>

          <MenuItem value="ACTIVE">
            Active
          </MenuItem>

          <MenuItem value="COMPLETED">
            Completed
          </MenuItem>

          <MenuItem value="CANCELLED">
            Cancelled
          </MenuItem>
        </Select>
      </Stack>

      {/* ERROR */}

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

      {/* LOADING */}

      {loading ? (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : filteredProjects.length ===
        0 ? (
        /* EMPTY */

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
              minHeight: 300,
              display: "flex",
              flexDirection:
                "column",
              alignItems:
                "center",
              justifyContent:
                "center",
              textAlign: "center",
            }}
          >
            <FolderRoundedIcon
              sx={{
                fontSize: 55,
                color:
                  "text.secondary",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              fontWeight={700}
            >
              No projects available
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Create a project
              to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        /* PROJECT CARDS */

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 2.5,
          }}
        >
          {filteredProjects.map((project, index) => {
            const progress = getProgress(project.status);

            const uniqueKey = getProjectId(project) || `project-${index}`;

            return (
              <Card
                key={uniqueKey}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  height: "100%",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  {/* CARD HEADER */}

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Box
                      sx={{
                        mt: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{
                          mt: 0.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: 40,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          Progress
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          {progress}%
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={
                          progress
                        }
                        sx={{
                          height: 7,
                          borderRadius: 5,
                        }}
                      />
                    </Box>

                    {/* MENU BUTTON */}

                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, project)}
                      aria-label={`Project actions for ${project.name}`}
                    >
                      <MoreVertRoundedIcon />
                    </IconButton>
                  </Stack>

                  {/* PROGRESS */}

                  <Box
                    sx={{
                      mt: 2.5,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
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
                        fontWeight={600}
                      >
                        {getStatusLabel(
                          project.status,
                        )}
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 7,
                        borderRadius: 5,
                      }}
                    />
                  </Box>

                  {/* STATUS */}

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      mt: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>

                    <Typography variant="body2" fontWeight={600}>
                      {getStatusLabel(project.status)}
                    </Typography>
                  </Stack>

                  {/* TEAM */}

                  {project.teamId && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mt: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Team: {project.teamId}
                    </Typography>
                  )}

                  {/* AVATARS */}

                  <Stack
                    direction="row"
                    spacing={-0.8}
                    sx={{
                      mt: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        fontSize: 12,
                        border: 2,
                        borderColor: "background.paper",
                      }}
                    >
                      P
                    </Avatar>

                    {project.teamId && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display:
                            "block",
                          mt: 1,
                        }}
                      >
                        Team:{" "}
                        {
                          project.teamId
                        }
                      </Typography>
                    )}

                    {/* AVATARS */}

                    <Stack
                      direction="row"
                      spacing={-0.8}
                      sx={{
                        mt: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          fontSize: 12,
                        }}
                      >
                        P
                      </Avatar>

                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          fontSize: 12,
                        }}
                      >
                        M
                      </Avatar>

                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          fontSize: 12,
                        }}
                      >
                        T
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              );
            },
          )}
        </Box>
      )}

      {/* ======================================================
          PROJECT ACTION MENU
      ======================================================= */}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={
          handleMenuClose
        }
        transformOrigin={{
          horizontal: "right",
          vertical: "top",
        }}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
        PaperProps={{
          elevation: 2,
          sx: {
            minWidth: 140,
            borderRadius: 2,
            mt: 1,
          },
        }}
      >
        {/* EDIT */}

        <MenuItem
          onClick={
            handleEditClick
          }
          sx={{
            py: 1,
          }}
        >
          <EditRoundedIcon
            fontSize="small"
            sx={{
              mr: 1.5,
              color:
                "text.secondary",
            }}
          />

          <Typography
            variant="body2"
            fontWeight={500}
          >
            Edit
          </Typography>
        </MenuItem>

        {/* DELETE */}

        <MenuItem
          onClick={
            handleDeleteClick
          }
          sx={{
            py: 1,
            color: "error.main",
          }}
        >
          <DeleteRoundedIcon
            fontSize="small"
            sx={{
              mr: 1.5,
            }}
          />

          <Typography
            variant="body2"
            fontWeight={500}
          >
            Delete
          </Typography>
        </MenuItem>
      </Menu>

      {/* ======================================================
          DELETE CONFIRMATION DIALOG
      ======================================================= */}

      <Dialog
        open={
          deleteDialogOpen
        }
        onClose={() =>
          setDeleteDialogOpen(
            false,
          )
        }
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle
          fontWeight={700}
        >
          Delete Project?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want
            to delete{" "}
            <b>
              {
                selectedProject?.name
              }
            </b>
            ?

            <br />

            This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={() =>
              setDeleteDialogOpen(
                false,
              )
            }
            color="inherit"
            sx={{
              textTransform:
                "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={
              handleDeleteConfirm
            }
            color="error"
            variant="contained"
            disableElevation
            sx={{
              textTransform:
                "none",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREATE */}

      <CreateProjectDialog
        open={createOpen}
        onClose={handleCreateClose}
        onCreated={loadProjects}
      />

      {/* EDIT */}

      {selectedProject && (
        <EditProjectDialog
          open={editOpen}
          project={
            selectedProject
          }
          onClose={() =>
            setEditOpen(false)
          }
          onUpdated={
            loadProjects
          }
        />
      )}
    </Box>
  );
};

export default Projects;