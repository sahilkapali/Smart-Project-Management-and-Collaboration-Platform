import { useEffect, useState } from "react";

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
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import toast from "react-hot-toast";

import { createRepository } from "../../services/repository.service";
import projectService from "../../services/project.service";

import type { CreateRepositoryPayload } from "../../types/repository.types";
import type { Project } from "../../types/project.types";

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

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!trimmedProject) {
      setError("Please select a project.");
      return;
    }

    if (!trimmedName) {
      setError("Repository name is required.");
      return;
    }

    // ----------------------------------------------------------
    // CREATE REPOSITORY
    // ----------------------------------------------------------

    try {
      setLoading(true);
      setError("");

      const payload: CreateRepositoryPayload = {
        project: trimmedProject,
        name: trimmedName,
        description: trimmedDescription || undefined,
        githubUrl: trimmedGithubUrl || undefined,
      };

      console.log("Creating repository with payload:", payload);

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

  // ============================================================
  // UI
  // ============================================================

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Create Repository</DialogTitle>

      <DialogContent>
        <Box
          sx={{
            pt: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* ERROR MESSAGE */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* PROJECT SELECTION */}
          <FormControl fullWidth required>
            <InputLabel id="repository-project-label">Project</InputLabel>

            <Select
              labelId="repository-project-label"
              id="repository-project"
              value={project}
              label="Project"
              onChange={(event) => {
                setProject(event.target.value);
                setError("");
              }}
              disabled={loading || projectsLoading}
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
                projects.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* REPOSITORY NAME */}
          <TextField
            label="Repository Name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            fullWidth
            required
            autoFocus
            disabled={loading}
            placeholder="e.g. frontend"
          />

          {/* DESCRIPTION */}
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={loading}
            placeholder="Describe this repository"
          />

          {/* GITHUB URL */}
          <TextField
            label="GitHub URL"
            value={githubUrl}
            onChange={(event) => setGithubUrl(event.target.value)}
            fullWidth
            disabled={loading}
            type="url"
            placeholder="https://github.com/username/repository"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            textTransform: "none",
          }}
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
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Creating...
            </>
          ) : (
            "Create Repository"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRepositoryModal;
