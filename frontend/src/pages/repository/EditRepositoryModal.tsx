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
  TextField,
} from "@mui/material";

import toast from "react-hot-toast";

import { updateRepository } from "../../services/repository.service";

import type {
  Repository,
  UpdateRepositoryPayload,
} from "../../types/repository.types";

interface EditRepositoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  repository: Repository;
}

const EditRepositoryModal = ({
  open,
  onClose,
  onSuccess,
  repository,
}: EditRepositoryModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !repository) return;

    setName(repository.name || "");
    setDescription(repository.description || "");
    setGithubUrl(repository.githubUrl || "");
    setError("");
  }, [open, repository]);

  const handleClose = () => {
    if (loading) return;

    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedGithubUrl = githubUrl.trim();

    if (!trimmedName) {
      setError("Repository name is required.");
      return;
    }

    if (!repository?._id) {
      setError("Repository ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload: UpdateRepositoryPayload = {
        name: trimmedName,
        description: trimmedDescription || undefined,
        githubUrl: trimmedGithubUrl || undefined,
      };

      await updateRepository(repository._id, payload);

      toast.success("Repository updated successfully.");

      await onSuccess();

      onClose();
    } catch (err: any) {
      console.error("Failed to update repository:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update repository.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Repository</DialogTitle>

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
            label="Repository Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            required
            autoFocus
            disabled={loading}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            multiline
            minRows={3}
            disabled={loading}
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
          disabled={loading || !name.trim()}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditRepositoryModal;
