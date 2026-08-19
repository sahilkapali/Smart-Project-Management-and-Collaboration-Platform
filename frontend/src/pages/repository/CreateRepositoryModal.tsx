import { useEffect, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import FolderIcon from "@mui/icons-material/Folder";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import toast from "react-hot-toast";

import projectService from "../../services/project.service";
import { createRepository } from "../../services/repository.service";

import type { Project } from "../../types/project.types";
import type { CreateRepositoryPayload } from "../../types/repository.types";

interface CreateRepositoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

const CreateRepositoryModal = ({
  open,
  onClose,
  onSuccess,
}: CreateRepositoryModalProps) => {
  // ============================================================
  // FORM STATE
  // ============================================================
  const [project, setProject] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // ============================================================
  // PROJECT STATE
  // ============================================================
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // ============================================================
  // GENERAL STATE
  // ============================================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD PROJECTS
  // ============================================================
  useEffect(() => {
    if (!open) return;

    const loadProjects = async () => {
      try {
        setProjectsLoading(true);
        setError("");

        const data = await projectService.getProjects();
        setProjects(data);
      } catch (err: any) {
        console.error("Failed to load projects:", err);
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load projects.";

        setError(message);
        toast.error(message);
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, [open]);

  // ============================================================
  // RESET FORM
  // ============================================================
  const resetForm = () => {
    setProject("");
    setName("");
    setDescription("");
    setGithubUrl("");
    setError("");
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================
  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  // ============================================================
  // SUBMIT
  // ============================================================
  const handleSubmit = async () => {
    const trimmedProject = project.trim();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedGithubUrl = githubUrl.trim();

    if (!trimmedProject) {
      setError("Please select a project.");
      return;
    }

    if (!trimmedName) {
      setError("Repository name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload: CreateRepositoryPayload = {
        project: trimmedProject,
        name: trimmedName,
        description: trimmedDescription || undefined,
        githubUrl: trimmedGithubUrl || undefined,
      };

      await createRepository(payload);

      toast.success("Repository created successfully.");
      resetForm();
      await onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to create repository:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create repository.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      {/* DIALOG HEADER */}
      <DialogTitle sx={{ m: 0, p: 2, px: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <FolderIcon sx={{ color: "#5e35b1" }} />
            <Typography variant="h6" fontWeight={700}>
              Create Repository
            </Typography>
          </Stack>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            disabled={loading}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* DIALOG CONTENT */}
      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          {/* PROJECT SELECTION */}
          <FormControl fullWidth required>
            <InputLabel id="repository-project-label">Project</InputLabel>
            <Select
              labelId="repository-project-label"
              id="repository-project"
              value={project}
              label="Project"
              onChange={(e) => {
                setProject(e.target.value);
                setError("");
              }}
              disabled={loading || projectsLoading}
              sx={{ borderRadius: 2 }}
            >
              {projectsLoading ? (
                <MenuItem disabled value="">
                  Loading projects...
                </MenuItem>
              ) : projects.length === 0 ? (
                <MenuItem disabled value="">
                  No projects available
                </MenuItem>
              ) : (
                projects.map((item) => {
                  const projectId = item.id || (item as any)._id;
                  return (
                    <MenuItem key={projectId} value={projectId}>
                      {item.name}
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>

          {/* REPOSITORY NAME */}
          <TextField
            label="Repository Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            fullWidth
            required
            autoFocus
            disabled={loading}
            placeholder="e.g. frontend-core"
            InputProps={{ sx: { borderRadius: 2 } }}
          />

          {/* DESCRIPTION */}
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={loading}
            placeholder="Briefly describe the contents or purpose of this repository"
            InputProps={{ sx: { borderRadius: 2 } }}
          />

          {/* GITHUB URL */}
          <TextField
            label="GitHub URL"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            fullWidth
            disabled={loading}
            type="url"
            placeholder="https://github.com/organization/repository"
            InputProps={{ sx: { borderRadius: 2 } }}
          />
        </Box>
      </DialogContent>

      {/* DIALOG ACTIONS */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: "none", color: "text.secondary", borderRadius: 2 }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            loading || projectsLoading || !name.trim() || !project.trim()
          }
          sx={{
            bgcolor: "#5e35b1",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            "&:hover": { bgcolor: "#4527a0" },
          }}
        >
          {loading ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={18} color="inherit" />
              <span>Creating...</span>
            </Stack>
          ) : (
            "Create Repository"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRepositoryModal;