import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
import EditProjectDialog from "./EditProjectDialog"; // Imported the new component

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);

  // --- MENU AND DIALOG STATES ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false); // Uncommented

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data: any = await projectService.getProjects();

      const projectsData = Array.isArray(data)
        ? data
        : data?.projects || data?.data || [];

      setProjects(projectsData);
    } catch (err: any) {
      console.error("Loading projects failed:", err);
      setError(err?.response?.data?.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const safeProjects = Array.isArray(projects) ? projects : [];
  
  const filteredProjects = safeProjects.filter((project) => {
    const searchValue = search.trim().toLowerCase();
    
    const matchesSearch =
      !searchValue ||
      project.name?.toLowerCase().includes(searchValue) ||
      project.description?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "ALL" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    if (!status) return "Unknown";
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
      case "CANCELLED":
      default:
        return 0;
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    setEditOpen(true); // Replaced alert with the actual dialog trigger
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    
    const projectId = selectedProject.id || (selectedProject as any)._id;
    
    try {
      await projectService.deleteProject(projectId);
      setDeleteDialogOpen(false);
      setSelectedProject(null);
      loadProjects(); 
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      setError(err?.response?.data?.message || "Failed to delete project.");
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{ fontSize: { xs: "1.8rem", sm: "2.2rem" }, fontWeight: 700 }}
          >
            Projects
          </Typography>
          <Typography color="text.secondary">
            Manage and track all your projects
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 2.5 }}
        >
          New Project
        </Button>
      </Stack>

      {/* Search/filter */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search projects..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          sx={{ width: { xs: "100%", sm: 320 } }}
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
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </Select>
      </Stack>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : filteredProjects.length === 0 ? (
        /* Empty state */
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <CardContent
            sx={{
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <FolderRoundedIcon sx={{ fontSize: 55, color: "text.secondary", mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              No projects available
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Create a project to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        /* Project cards */
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
          {filteredProjects.map((project, index) => {
            const progress = getProgress(project.status);
            const uniqueKey = project.id || (project as any)._id || `project-fallback-${index}`;

            return (
              <Card
                key={uniqueKey}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  transition: "0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography fontWeight={700} fontSize={17}>
                        {project.name || "Untitled Project"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {project.description || "No description available."}
                      </Typography>
                    </Box>

                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, project)}>
                      <MoreVertRoundedIcon />
                    </IconButton>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.7 }}>
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
                      sx={{ height: 6, borderRadius: 5 }}
                    />
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {getStatusLabel(project.status)}
                    </Typography>
                  </Stack>

                  {project.teamId && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      Team: {project.teamId}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={-0.8} sx={{ mt: 2 }}>
                    <Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>P</Avatar>
                    <Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>M</Avatar>
                    <Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>T</Avatar>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* --- MENU COMPONENT --- */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 2,
          sx: { minWidth: 120, borderRadius: 2, mt: 1 }
        }}
      >
        <MenuItem onClick={handleEditClick} sx={{ py: 1 }}>
          <EditRoundedIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight={500}>Edit</Typography>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ py: 1, color: "error.main" }}>
          <DeleteRoundedIcon fontSize="small" sx={{ mr: 1.5 }} />
          <Typography variant="body2" fontWeight={500}>Delete</Typography>
        </MenuItem>
      </Menu>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 }}}>
        <DialogTitle fontWeight={700}>Delete Project?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <b>{selectedProject?.name}</b>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disableElevation sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadProjects}
      />

      {/* --- EDIT PROJECT DIALOG --- */}
      {selectedProject && (
        <EditProjectDialog
          open={editOpen}
          project={selectedProject}
          onClose={() => setEditOpen(false)}
          onUpdated={loadProjects}
        />
      )}
    </Box>
  );
};

export default Projects;