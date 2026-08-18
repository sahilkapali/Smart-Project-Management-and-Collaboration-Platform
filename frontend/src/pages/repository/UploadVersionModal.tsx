import { useState, type ChangeEvent, type FormEvent } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import type { UploadVersionModalProps } from "../../types/repository.types";

import { createRepositoryVersion } from "../../services/repository.service";

// ============================================================
// COMPONENT
// ============================================================

const UploadVersionModal = ({
  open,
  onClose,
  repositoryId,
  onSuccess,
}: UploadVersionModalProps) => {
  const [versionNumber, setVersionNumber] = useState("");

  const [title, setTitle] = useState("");

  const [changelog, setChangelog] = useState("");

  const [commitHash, setCommitHash] = useState("");

  const [file, setFile] = useState<File | undefined>();

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
  // CLOSE
  // ==========================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    resetForm();

    onClose();
  };

  // ==========================================================
  // FILE CHANGE
  // ==========================================================

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    setFile(selectedFile);
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

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

      if (onSuccess) {
        onSuccess(version);
      }

      resetForm();

      onClose();
    } catch (err: any) {
      console.error("Failed to create repository version:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload repository version.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Upload Repository Version</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <TextField
              label="Version Number"
              placeholder="v1.0.0"
              value={versionNumber}
              onChange={(event) => setVersionNumber(event.target.value)}
              fullWidth
              required
              disabled={loading}
            />

            <TextField
              label="Version Title"
              placeholder="Initial Release"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              fullWidth
              required
              disabled={loading}
            />

            <TextField
              label="Changelog"
              placeholder="Describe what changed in this version..."
              value={changelog}
              onChange={(event) => setChangelog(event.target.value)}
              fullWidth
              multiline
              rows={4}
              disabled={loading}
            />

            <TextField
              label="Commit Hash"
              placeholder="Optional Git commit hash"
              value={commitHash}
              onChange={(event) => setCommitHash(event.target.value)}
              fullWidth
              disabled={loading}
            />

            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={600}>
                Version File
              </Typography>

              <Button variant="outlined" component="label" disabled={loading}>
                Select File
                <input hidden type="file" onChange={handleFileChange} />
              </Button>

              {file && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {file.name}
                </Typography>
              )}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Uploading..." : "Upload Version"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UploadVersionModal;
