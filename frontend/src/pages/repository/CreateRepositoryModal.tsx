import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import toast from "react-hot-toast";

import { createRepository } from "../../services/repository.service";

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
  const [project, setProject] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setProject("");
    setName("");
    setDescription("");
    setGithubUrl("");
    setError("");
  };

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedProject = project.trim();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedGithubUrl = githubUrl.trim();

    if (!trimmedProject) {
      setError("Project ID is required.");
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
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Project ID"
            value={project}
            onChange={(event) => setProject(event.target.value)}
            fullWidth
            required
            disabled={loading}
            placeholder="Enter project ID"
          />

          <TextField
            label="Repository Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            required
            autoFocus
            disabled={loading}
            placeholder="e.g. frontend"
          />

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
          disabled={loading || !name.trim() || !project.trim()}
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
