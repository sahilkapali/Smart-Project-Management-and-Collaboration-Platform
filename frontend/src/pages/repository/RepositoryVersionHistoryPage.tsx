import { useEffect, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import LockResetIcon from "@mui/icons-material/LockReset";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";

import UploadVersionModal from "./UploadVersionModal";
import { getRepositoryVersions } from "../../services/repository.service";
import type { RepositoryVersion } from "../../types/repository.types";

const RepositoryVersionHistoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ============================================================
  // STATE
  // ============================================================
  const [versions, setVersions] = useState<RepositoryVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // ============================================================
  // FETCH VERSIONS
  // ============================================================
  const loadVersions = async () => {
    if (!id) {
      setError("Repository ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getRepositoryVersions(id);
      setVersions(data);
    } catch (err: any) {
      console.error("Failed to load repository versions:", err);

      if (err?.response?.status === 404) {
        setVersions([]);
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load repository versions.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [id]);

  // ============================================================
  // RENDER LOADING
  // ============================================================
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress sx={{ color: "#5e35b1" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER BAR */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={4}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              color: "text.secondary",
              borderColor: "divider",
            }}
          >
            Back
          </Button>

          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <HistoryIcon sx={{ color: "#5e35b1", fontSize: 28 }} />
              <Typography variant="h5" fontWeight={700}>
                Version History
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Track and download previous releases and changelogs
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsUploadOpen(true)}
          sx={{
            bgcolor: "#5e35b1",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            py: 1,
            "&:hover": { bgcolor: "#4527a0" },
          }}
        >
          Upload New Release
        </Button>
      </Stack>

      {/* ERROR ALERT */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* EMPTY STATE */}
      {!error && versions.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <LockResetIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="h6" fontWeight={600} color="text.secondary">
            No Releases Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            No version history has been published for this repository yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsUploadOpen(true)}
            sx={{
              bgcolor: "#5e35b1",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { bgcolor: "#4527a0" },
            }}
          >
            Create First Release
          </Button>
        </Paper>
      )}

      {/* VERSION TIMELINE LIST */}
      <Stack spacing={2.5}>
        {versions.map((version) => {
          const versionId = version._id || (version as any).id;

          return (
            <Paper
              key={versionId}
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 3,
                transition: "box-shadow 0.2s ease",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                mb={1.5}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Chip
                    label={version.versionNumber}
                    sx={{
                      bgcolor: "#5e35b1",
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: 1.5,
                    }}
                  />
                  <Typography variant="h6" fontWeight={700}>
                    {version.title}
                  </Typography>
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  Released on{" "}
                  {new Date(version.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </Stack>

              {/* CHANGELOG */}
              {version.changelog && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    whiteSpace: "pre-line",
                    bgcolor: "action.hover",
                    p: 2,
                    borderRadius: 2,
                    my: 1.5,
                  }}
                >
                  {version.changelog}
                </Typography>
              )}

              <Divider sx={{ my: 1.5 }} />

              {/* FOOTER METADATA & DOWNLOAD */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
              >
                <Box>
                  {version.commitHash ? (
                    <Chip
                      size="small"
                      label={`Commit: ${version.commitHash.slice(0, 8)}`}
                      variant="outlined"
                      sx={{
                        fontFamily: "monospace",
                        borderRadius: 1,
                        fontSize: "0.75rem",
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      No commit hash associated
                    </Typography>
                  )}
                </Box>

                {version.file && (
                  <Button
                    component="a"
                    href={version.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      color: "#5e35b1",
                      borderColor: "#5e35b1",
                      "&:hover": {
                        borderColor: "#4527a0",
                        bgcolor: "rgba(94, 53, 177, 0.04)",
                      },
                    }}
                  >
                    Download Release File
                  </Button>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      {/* UPLOAD MODAL */}
      {id && (
        <UploadVersionModal
          open={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          repositoryId={id}
          onSuccess={loadVersions}
        />
      )}
    </Container>
  );
};

export default RepositoryVersionHistoryPage;
