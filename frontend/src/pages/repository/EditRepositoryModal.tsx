import { useEffect, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
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
  repository: Repository | null;
}

const EditRepositoryModal = ({
  open,
  onClose,
  onSuccess,
  repository,
}: EditRepositoryModalProps) => {
  // ============================================================
  // FORM STATE
  // ============================================================
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // ============================================================
  // GENERAL STATE
  // ============================================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Safely resolve ID across standard and transformed interfaces
  const repoId = repository?._id || (repository as any)?.id || "";

  // ============================================================
  // PREFILL FORM DATA
  // ============================================================
  useEffect(() => {
    if (!open || !repository) return;

    setName(repository.name || "");
    setDescription(repository.description || "");
    setGithubUrl(repository.githubUrl || "");
    setError("");
  }, [open, repository]);

  // ============================================================
  // CLOSE MODAL
  // ============================================================
  const handleClose = () => {
    if (loading) return;

    setError("");
    onClose();
  };

  // ============================================================
  // SUBMIT HANDLER
  // ============================================================
  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedGithubUrl = githubUrl.trim();

    if (!trimmedName) {
      setError("Repository name is required.");
      return;
    }

    if (!repoId) {
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

      await updateRepository(repoId, payload);

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
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <EditIcon sx={{ color: "#5e35b1" }} />
            <Typography variant="h6" fontWeight={700}>
              Edit Repository
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
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

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
            placeholder="e.g. backend-api"
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
            placeholder="Brief description of this repository"
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
          sx={{
            textTransform: "none",
            color: "text.secondary",
            borderRadius: 2,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
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
              <span>Saving...</span>
            </Stack>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditRepositoryModal;
