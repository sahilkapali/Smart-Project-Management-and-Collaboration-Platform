import { useCallback, useEffect, useState } from "react";

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
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import projectService from "../../services/project.service";
import type { Project } from "../../types/project.types";

import CreateProjectDialog from "./CreateProjectDialog";
import EditProjectDialog from "./EditProjectDialog";

const Projects = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);

  // ============================================================
  // LOAD PROJECTS
  // ============================================================

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data: any = await projectService.getProjects();

      const projectsData = Array.isArray(data)
        ? data
        : data?.projects || data?.data || [];

      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err: any) {
      console.error("Loading projects failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load projects.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

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
  // STATUS HELPERS
  // ============================================================

  const getStatusLabel = (status: string) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getProgress = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return 100;

      case "IN_PROGRESS":
      case "ACTIVE":
        return 50;

      case "PENDING":
        return 0;

      case "CANCELLED":
        return 0;

      default:
        return 0;
    }
  };

  // ============================================================
  // PROJECT MENU
  // ============================================================

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    project: Project,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // ============================================================
  // EDIT PROJECT
  // ============================================================

  const handleEditClick = () => {
    handleMenuClose();

    if (!selectedProject) {
      return;
    }

    setEditOpen(true);
  };

  // ============================================================
  // DELETE PROJECT
  // ============================================================

  const handleDeleteClick = () => {
    handleMenuClose();

    if (!selectedProject) {
      return;
    }

    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) {
      return;
    }

    const projectId = selectedProject.id || (selectedProject as any)._id;

    if (!projectId) {
      setError("Project ID is missing.");
      setDeleteDialogOpen(false);
      return;
    }

    try {
      await projectService.deleteProject(projectId);

      setProjects((previousProjects) =>
        previousProjects.filter((project) => {
          const currentId = project.id || (project as any)._id;

          return currentId !== projectId;
        }),
      );

      setDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (err: any) {
      console.error("Failed to delete project:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete project.",
      );

      setDeleteDialogOpen(false);
    }
  };

  // ============================================================
  // CLOSE EDIT
  // ============================================================

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedProject(null);
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* ======================================================
          HEADER
      ======================================================= */}

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
            Projects
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage and track all your projects
          </Typography>
        </Box>

        {/* NEW PROJECT */}

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 2.5,
          }}
        >
          New Project
        </Button>
      </Stack>

      {/* ======================================================
          SEARCH + FILTER
      ======================================================= */}

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
          placeholder="Search projects..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          sx={{
            maxWidth: {
              xs: "100%",
              sm: 360,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Select
          size="small"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          sx={{
            minWidth: 150,
          }}
        >
          <MenuItem value="ALL">All</MenuItem>

          <MenuItem value="PENDING">Pending</MenuItem>

          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>

          <MenuItem value="ACTIVE">Active</MenuItem>

          <MenuItem value="COMPLETED">Completed</MenuItem>

          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </Select>
      </Stack>

      {/* ======================================================
          ERROR
      ======================================================= */}

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
              onClick={() => void loadProjects()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ======================================================
          LOADING
      ======================================================= */}

      {loading ? (
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

            <Typography color="text.secondary">Loading projects...</Typography>
          </Stack>
        </Box>
      ) : filteredProjects.length === 0 ? (
        /* ====================================================
           EMPTY STATE
        ===================================================== */

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
              }}
            >
              {search || statusFilter !== "ALL"
                ? "No projects match your current filters."
                : "Create a project to get started."}
            </Typography>

            {!search && statusFilter === "ALL" && (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setCreateOpen(true)}
                sx={{
                  mt: 2,
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ====================================================
           PROJECT CARDS
        ===================================================== */

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

            const uniqueKey =
              project.id || (project as any)._id || `project-${index}`;

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
                  {/* =====================================
                        CARD HEADER
                    ====================================== */}

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Box
                      sx={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Typography fontWeight={700} fontSize={17} noWrap>
                        {project.name || "Untitled Project"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,

                          display: "-webkit-box",

                          WebkitLineClamp: 2,

                          WebkitBoxOrient: "vertical",

                          overflow: "hidden",

                          minHeight: 40,
                        }}
                      >
                        {project.description || "No description available."}
                      </Typography>
                    </Box>

                    {/* MENU */}

                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, project)}
                    >
                      <MoreVertRoundedIcon />
                    </IconButton>
                  </Stack>

                  {/* =====================================
                        PROGRESS
                    ====================================== */}

                  <Box
                    sx={{
                      mt: 2.5,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        mb: 0.7,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        Progress
                      </Typography>

                      <Typography variant="body2" fontWeight={700}>
                        {progress}%
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

                  {/* =====================================
                        STATUS
                    ====================================== */}

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

                  {/* =====================================
                        TEAM
                    ====================================== */}

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

                  {/* =====================================
                        AVATARS
                    ====================================== */}

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

                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        fontSize: 12,
                        border: 2,
                        borderColor: "background.paper",
                      }}
                    >
                      M
                    </Avatar>

                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        fontSize: 12,
                        border: 2,
                        borderColor: "background.paper",
                      }}
                    >
                      T
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ======================================================
          PROJECT MENU
      ======================================================= */}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
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
        <MenuItem
          onClick={handleEditClick}
          sx={{
            py: 1,
          }}
        >
          <EditRoundedIcon
            fontSize="small"
            sx={{
              mr: 1.5,
              color: "text.secondary",
            }}
          />

          <Typography variant="body2" fontWeight={500}>
            Edit
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={handleDeleteClick}
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

          <Typography variant="body2" fontWeight={500}>
            Delete
          </Typography>
        </MenuItem>
      </Menu>

      {/* ======================================================
          DELETE DIALOG
      ======================================================= */}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle fontWeight={700}>Delete Project?</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{selectedProject?.name}</strong>? This action cannot be
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
            onClick={() => setDeleteDialogOpen(false)}
            color="inherit"
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={() => void handleDeleteConfirm()}
            color="error"
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          CREATE PROJECT DIALOG
      ======================================================= */}

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadProjects}
      />

      {/* ======================================================
          EDIT PROJECT DIALOG
      ======================================================= */}

      {selectedProject && (
        <EditProjectDialog
          open={editOpen}
          project={selectedProject}
          onClose={handleEditClose}
          onUpdated={loadProjects}
        />
      )}
    </Box>
  );
};

export default Projects;
