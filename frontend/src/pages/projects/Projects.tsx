import {
  useCallback,
  useEffect,
  useState,
} from "react";

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
  const navigate = useNavigate();

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

  const [createOpen, setCreateOpen] =
    useState(false);

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  /*
   * LOAD PROJECTS
   */
  const loadProjects =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data: any =
          await projectService.getProjects();

        const projectsData =
          Array.isArray(data)
            ? data
            : data?.projects ||
              data?.data ||
              [];

        setProjects(projectsData);
      } catch (err: any) {
        console.error(
          "Loading projects failed:",
          err,
        );

        if (
          err?.response?.status === 403
        ) {
          setError(
            "You do not have permission to view these projects.",
          );
        } else {
          setError(
            err?.response?.data?.message ||
              "Unable to load projects.",
          );
        }
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  /*
   * SAFE PROJECT LIST
   */
  const safeProjects =
    Array.isArray(projects)
      ? projects
      : [];

  /*
   * SEARCH + FILTER
   */
  const filteredProjects =
    safeProjects.filter(
      (project) => {
        const searchValue =
          search
            .trim()
            .toLowerCase();

        const matchesSearch =
          !searchValue ||
          project.name
            ?.toLowerCase()
            .includes(searchValue) ||
          project.description
            ?.toLowerCase()
            .includes(searchValue);

        const matchesStatus =
          statusFilter === "ALL" ||
          project.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      },
    );

  /*
   * STATUS LABEL
   */
  const getStatusLabel = (
    status: string,
  ) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      );
  };

  /*
   * PROGRESS
   */
  const getProgress = (
    status: string,
  ) => {
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

  /*
   * GET PROJECT ID
   *
   * Supports the common formats used by
   * MongoDB/backend responses:
   *
   *   project.id
   *   project._id
   *   project.projectId
   *
   * It also handles MongoDB's:
   *
   *   { $oid: "..." }
   */
  const getProjectId = (
    project: Project,
  ): string => {
    const value =
      project as any;

    const normalizeId = (
      id: any,
    ): string => {
      if (!id) {
        return "";
      }

      if (
        typeof id === "string" ||
        typeof id === "number"
      ) {
        return String(id);
      }

      if (
        typeof id === "object" &&
        id.$oid
      ) {
        return String(id.$oid);
      }

      if (
        typeof id === "object" &&
        id._id
      ) {
        return normalizeId(
          id._id,
        );
      }

      return "";
    };

    return (
      normalizeId(value.id) ||
      normalizeId(value._id) ||
      normalizeId(
        value.projectId,
      )
    );
  };

  /*
   * OPEN PROJECT DETAILS
   */
  const handleProjectClick = (
    project: Project,
  ) => {
    const projectId =
      getProjectId(project);

    if (!projectId) {
      setError(
        "This project does not have a valid ID.",
      );
      return;
    }

    navigate(
      `/projects/${String(projectId)}`,
    );
  };

  /*
   * OPEN THREE-DOT MENU
   */
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    project: Project,
  ) => {
    event.stopPropagation();

    setAnchorEl(
      event.currentTarget,
    );

    setSelectedProject(
      project,
    );
  };

  /*
   * CLOSE MENU
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /*
   * EDIT
   */
  const handleEditClick = () => {
    handleMenuClose();
    setEditOpen(true);
  };

  /*
   * DELETE
   */
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  /*
   * CONFIRM DELETE
   */
  const handleDeleteConfirm =
    async () => {
      if (!selectedProject) {
        return;
      }

      const projectId =
        getProjectId(
          selectedProject,
        );

      if (!projectId) {
        setError(
          "Invalid project ID.",
        );
        return;
      }

      try {
        await projectService.deleteProject(
          projectId,
        );

        setDeleteDialogOpen(
          false,
        );

        setSelectedProject(
          null,
        );

        await loadProjects();
      } catch (err: any) {
        console.error(
          "Failed to delete project:",
          err,
        );

        if (
          err?.response?.status === 403
        ) {
          setError(
            "You do not have permission to delete this project.",
          );
        } else {
          setError(
            err?.response?.data
              ?.message ||
              "Failed to delete project.",
          );
        }

        setDeleteDialogOpen(
          false,
        );
      }
    };

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
            gap: 2,
          }}
        >
          {filteredProjects.map(
            (
              project,
              index,
            ) => {
              const progress =
                getProgress(
                  project.status,
                );

              const uniqueKey =
                getProjectId(
                  project,
                ) ||
                `project-${index}`;

              return (
                <Card
                  key={uniqueKey}
                  elevation={0}
                  onClick={() =>
                    handleProjectClick(
                      project,
                    )
                  }
                  sx={{
                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                    borderRadius: 3,

                    cursor:
                      "pointer",

                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease",

                    "&:hover": {
                      transform:
                        "translateY(-4px)",

                      boxShadow:
                        "0 12px 30px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent>
                    {/* PROJECT TITLE */}

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          fontWeight={700}
                          fontSize={17}
                          noWrap
                        >
                          {project.name ||
                            "Untitled Project"}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            display:
                              "-webkit-box",
                            WebkitLineClamp:
                              2,
                            WebkitBoxOrient:
                              "vertical",
                            overflow:
                              "hidden",
                          }}
                        >
                          {project.description ||
                            "No description available."}
                        </Typography>
                      </Box>

                      {/* THREE DOTS */}

                      <IconButton
                        size="small"
                        onClick={(event) =>
                          handleMenuOpen(
                            event,
                            project,
                          )
                        }
                      >
                        <MoreVertRoundedIcon />
                      </IconButton>
                    </Stack>

                    {/* PROGRESS */}

                    <Box
                      sx={{
                        mt: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{
                          mb: 0.7,
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

                    {/* STATUS */}

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

                    {/* TEAM */}

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

      {/* THREE-DOT MENU */}

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

      {/* DELETE DIALOG */}

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
        onClose={() =>
          setCreateOpen(false)
        }
        onCreated={
          loadProjects
        }
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