import React, { useEffect, useState } from "react";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import {
  Alert,
  Box,
  Button,
  Chip,
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

// Import types from repository.types
import type {
  RepositoryVersion,
  UploadVersionModalProps,
} from "../../types/repository.types";

// Import version service methods
import {
  createRepositoryVersion,
  getRepositoryVersions,
} from "../../services/repository.service";

// Helper: Parse Semantic Versioning and suggest next options
const parseSemver = (versionStr?: string) => {
  if (!versionStr) {
    return {
      patch: "1.0.0",
      minor: "1.1.0",
      major: "2.0.0",
    };
  }

  const hasVPrefix = versionStr.toLowerCase().startsWith("v");
  const cleaned = versionStr.replace(/^v/i, "").trim();
  const parts = cleaned.split(".").map((p) => parseInt(p, 10));

  if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
    const [major, minor, patch] = parts;
    const prefix = hasVPrefix ? "v" : "";

    return {
      patch: `${prefix}${major}.${minor}.${patch + 1}`,
      minor: `${prefix}${major}.${minor + 1}.0`,
      major: `${prefix}${major + 1}.0.0`,
    };
  }

  return {
    patch: "1.0.0",
    minor: "1.1.0",
    major: "2.0.0",
  };
};

const UploadVersionModal: React.FC<UploadVersionModalProps> = ({
  open,
  repositoryId,
  onClose,
  onSuccess,
}) => {
  // Form State
  const [versionNumber, setVersionNumber] = useState<string>("");
  const [releaseTitle, setReleaseTitle] = useState<string>("");
  const [changelog, setChangelog] = useState<string>("");
  const [commitHash, setCommitHash] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // UI State
  const [fetchingLatest, setFetchingLatest] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quick increment options state
  const [versionOptions, setVersionOptions] = useState<{
    patch: string;
    minor: string;
    major: string;
  }>({ patch: "1.0.0", minor: "1.1.0", major: "2.0.0" });

  // ==========================================================
  // FETCH LATEST VERSION & AUTO-INCREMENT ON OPEN
  // ==========================================================
  useEffect(() => {
    if (!open || !repositoryId) return;

    const fetchLatestVersion = async () => {
      setFetchingLatest(true);
      setError(null);

      try {
        const versions: RepositoryVersion[] =
          await getRepositoryVersions(repositoryId);

        let latestVersionStr: string | undefined;

        if (Array.isArray(versions) && versions.length > 0) {
          // Strictly access versionNumber (with version as a fallback alias)
          latestVersionStr =
            versions[0]?.versionNumber || versions[0]?.version;
        }

        const options = parseSemver(latestVersionStr);
        setVersionOptions(options);

        // Pre-fill with auto-incremented patch version
        setVersionNumber(options.patch);
        setReleaseTitle(`Release ${options.patch}`);
      } catch (err: any) {
        console.error("Failed to fetch version history:", err);
        setVersionNumber("1.0.0");
        setReleaseTitle("Release 1.0.0");
      } finally {
        setFetchingLatest(false);
      }
    };

    fetchLatestVersion();
  }, [open, repositoryId]);

  // ==========================================================
  // RESET FORM
  // ==========================================================
  const handleReset = () => {
    setVersionNumber("");
    setReleaseTitle("");
    setChangelog("");
    setCommitHash("");
    setSelectedFile(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // ==========================================================
  // FILE SELECTION
  // ==========================================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // ==========================================================
  // SUBMIT FORM
  // ==========================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!versionNumber.trim()) {
      setError("Version number is required.");
      return;
    }

    if (!releaseTitle.trim()) {
      setError("Release title is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("repositoryId", repositoryId);
      formData.append("versionNumber", versionNumber.trim());
      formData.append("title", releaseTitle.trim());

      if (changelog.trim()) {
        formData.append("changelog", changelog.trim());
      }
      if (commitHash.trim()) {
        formData.append("commitHash", commitHash.trim());
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      // Pass repositoryId and formData to support both service signatures
      const createdVersion: RepositoryVersion =
        await createRepositoryVersion(repositoryId, formData);

      handleReset();

      if (onSuccess) {
        await onSuccess(createdVersion);
      }
    } catch (err: any) {
      console.error("Failed to upload version:", err);
      setError(
        err?.response?.data?.message || "Failed to upload new release version.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: "#232936",
          color: "#ffffff",
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              bgcolor: "rgba(103, 58, 183, 0.2)",
              p: 1,
              borderRadius: 2,
              display: "flex",
            }}
          >
            <CloudUploadIcon sx={{ color: "#7c4dff" }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Upload New Release
          </Typography>
        </Stack>

        <IconButton
          onClick={handleClose}
          sx={{ color: "grey.500", "&:hover": { color: "#fff" } }}
        >
          ✕
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2.5}>
            {/* VERSION NUMBER WITH AUTO-INCREMENT CHIPS */}
            <Box>
              <TextField
                label="Version Number *"
                fullWidth
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
                placeholder="e.g. 1.0.1"
                disabled={fetchingLatest}
                InputProps={{
                  endAdornment: fetchingLatest ? (
                    <CircularProgress size={20} sx={{ color: "#7c4dff" }} />
                  ) : null,
                }}
                sx={textFieldStyle}
              />

              {/* QUICK INCREMENT CHIPS */}
              {!fetchingLatest && (
                <Stack direction="row" spacing={1} mt={1} alignItems="center">
                  <Typography variant="caption" color="grey.400">
                    Auto-suggest:
                  </Typography>
                  <Chip
                    label={`Patch: ${versionOptions.patch}`}
                    size="small"
                    clickable
                    onClick={() => {
                      setVersionNumber(versionOptions.patch);
                      setReleaseTitle(`Release ${versionOptions.patch}`);
                    }}
                    sx={{
                      bgcolor:
                        versionNumber === versionOptions.patch
                          ? "#7c4dff"
                          : "#2d3545",
                      color: "#fff",
                      fontSize: "0.75rem",
                      "&:hover": { bgcolor: "#673ab7" },
                    }}
                  />
                  <Chip
                    label={`Minor: ${versionOptions.minor}`}
                    size="small"
                    clickable
                    onClick={() => {
                      setVersionNumber(versionOptions.minor);
                      setReleaseTitle(`Release ${versionOptions.minor}`);
                    }}
                    sx={{
                      bgcolor:
                        versionNumber === versionOptions.minor
                          ? "#7c4dff"
                          : "#2d3545",
                      color: "#fff",
                      fontSize: "0.75rem",
                      "&:hover": { bgcolor: "#673ab7" },
                    }}
                  />
                  <Chip
                    label={`Major: ${versionOptions.major}`}
                    size="small"
                    clickable
                    onClick={() => {
                      setVersionNumber(versionOptions.major);
                      setReleaseTitle(`Release ${versionOptions.major}`);
                    }}
                    sx={{
                      bgcolor:
                        versionNumber === versionOptions.major
                          ? "#7c4dff"
                          : "#2d3545",
                      color: "#fff",
                      fontSize: "0.75rem",
                      "&:hover": { bgcolor: "#673ab7" },
                    }}
                  />
                </Stack>
              )}
            </Box>

            {/* RELEASE TITLE */}
            <TextField
              label="Release Title *"
              fullWidth
              value={releaseTitle}
              onChange={(e) => setReleaseTitle(e.target.value)}
              placeholder="e.g. Release 1.0.1"
              sx={textFieldStyle}
            />

            {/* CHANGELOG */}
            <TextField
              label="Changelog / Release Notes"
              fullWidth
              multiline
              rows={3}
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="Describe key features or changes in this version..."
              sx={textFieldStyle}
            />

            {/* COMMIT HASH */}
            <TextField
              label="Commit Hash"
              fullWidth
              value={commitHash}
              onChange={(e) => setCommitHash(e.target.value)}
              placeholder="e.g. a1b2c3d"
              sx={textFieldStyle}
            />

            {/* FILE UPLOAD BOX */}
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                color="grey.300"
                mb={1}
              >
                Release Archive File (Optional)
              </Typography>

              <Button
                component="label"
                fullWidth
                variant="outlined"
                startIcon={
                  selectedFile ? (
                    <InsertDriveFileIcon />
                  ) : (
                    <CloudUploadIcon />
                  )
                }
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  borderStyle: "dashed",
                  borderColor: selectedFile ? "#7c4dff" : "#3e485e",
                  color: selectedFile ? "#7c4dff" : "#5d87ff",
                  bgcolor: "rgba(255, 255, 255, 0.02)",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#7c4dff",
                    bgcolor: "rgba(124, 77, 255, 0.08)",
                  },
                }}
              >
                {selectedFile
                  ? selectedFile.name
                  : "Select File (.zip, .tar.gz, etc.)"}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".zip,.tar.gz,.gz,.rar,.7z"
                />
              </Button>
            </Box>
          </Stack>
        </DialogContent>

        {/* ACTIONS */}
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={handleClose}
            sx={{ color: "grey.400", textTransform: "none" }}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={submitting || fetchingLatest}
            sx={{
              bgcolor: "#5e35b1",
              color: "#fff",
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              "&:hover": { bgcolor: "#4527a0" },
            }}
          >
            {submitting ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Upload Version"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Reusable Dark Input Field Styling
const textFieldStyle = {
  "& .MuiInputBase-root": {
    color: "#fff",
    bgcolor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 2,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#3e485e",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#7c4dff",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#7c4dff",
  },
  "& .MuiInputLabel-root": {
    color: "#9e9e9e",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#7c4dff",
  },
};

export default UploadVersionModal;