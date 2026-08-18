import { useState, type ChangeEvent, type FormEvent } from "react";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import toast from "react-hot-toast";

import { createRepositoryVersion } from "../../services/repository.service";
import type { UploadVersionModalProps } from "../../types/repository.types";

const UploadVersionModal = ({
  open,
  onClose,
  repositoryId,
  onSuccess,
}: UploadVersionModalProps) => {
  // ==========================================================
  // FORM STATE
  // ==========================================================
  const [versionNumber, setVersionNumber] = useState("");
  const [title, setTitle] = useState("");
  const [changelog, setChangelog] = useState("");
  const [commitHash, setCommitHash] = useState("");
  const [file, setFile] = useState<File | undefined>();

  // ==========================================================
  // GENERAL STATE
  // ==========================================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // RESET FORM
  // ==========================================================
  const resetForm = () => {
    setVersionNumber("");
    setTitle("");
    setChangelog("");
    setCommitHash("");
    setFile(undefined);
    setError("");
  };

  // ==========================================================
  // CLOSE HANDLER
  // ==========================================================
  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  // ==========================================================
  // FILE SELECTION
  // ==========================================================
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleClearFile = () => {
    setFile(undefined);
  };

  // Helper to format file sizes nicely
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // ==========================================================
  // SUBMIT HANDLER
  // ==========================================================
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!versionNumber.trim()) {
      setError("Version number is required.");
      return;
    }

    if (!title.trim()) {
      setError("Version title is required.");
      return;
    }

    try {
      setLoading(true);

      const version = await createRepositoryVersion(repositoryId, {
        versionNumber: versionNumber.trim(),
        title: title.trim(),
        changelog: changelog.trim(),
        commitHash: commitHash.trim(),
        file,
      });

      toast.success("New version release uploaded successfully!");

      if (onSuccess) {
        await onSuccess(version);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      console.error("Failed to create repository version:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload repository version.";

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
      <form onSubmit={handleSubmit}>
        {/* DIALOG HEADER */}
        <DialogTitle sx={{ m: 0, p: 2, px: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <CloudUploadIcon sx={{ color: "#5e35b1" }} />
              <Typography variant="h6" fontWeight={700}>
                Upload New Release
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
          <Stack spacing={2.5}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            {/* VERSION NUMBER */}
            <TextField
              label="Version Number"
              placeholder="e.g. v1.0.0"
              value={versionNumber}
              onChange={(e) => {
                setVersionNumber(e.target.value);
                setError("");
              }}
              fullWidth
              required
              autoFocus
              disabled={loading}
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            {/* VERSION TITLE */}
            <TextField
              label="Release Title"
              placeholder="e.g. Initial Major Release"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              fullWidth
              required
              disabled={loading}
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            {/* CHANGELOG */}
            <TextField
              label="Changelog / Release Notes"
              placeholder="Describe bug fixes, features, or breaking changes in this version..."
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              fullWidth
              multiline
              rows={4}
              disabled={loading}
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            {/* COMMIT HASH */}
            <TextField
              label="Commit Hash"
              placeholder="e.g. a1b2c3d4 (Optional)"
              value={commitHash}
              onChange={(e) => setCommitHash(e.target.value)}
              fullWidth
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 2, fontFamily: "monospace" },
              }}
            />

            {/* FILE UPLOAD SECTION */}
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Release Archive File (Optional)
              </Typography>

              {!file ? (
                <Button
                  variant="outlined"
                  component="label"
                  disabled={loading}
                  startIcon={<AttachFileIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    py: 1.2,
                    borderStyle: "dashed",
                  }}
                >
                  Select File (.zip, .tar.gz, etc.)
                  <input hidden type="file" onChange={handleFileChange} />
                </Button>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ overflow: "hidden" }}>
                    <AttachFileIcon color="action" />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(file.size)}
                      </Typography>
                    </Box>
                  </Stack>

                  <IconButton size="small" onClick={handleClearFile} disabled={loading} color="error">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Paper>
              )}
            </Stack>
          </Stack>
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
            type="submit"
            variant="contained"
            disabled={loading || !versionNumber.trim() || !title.trim()}
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
                <span>Uploading...</span>
              </Stack>
            ) : (
              "Upload Version"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UploadVersionModal;