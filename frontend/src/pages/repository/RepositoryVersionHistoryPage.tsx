import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import TagIcon from "@mui/icons-material/Tag";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

// Services & Types
import {
  getRepository,
  getRepositoryVersions,
} from "../../services/repository.service";
import type {
  Repository,
  RepositoryVersion,
} from "../../types/repository.types";

// Modals
import UploadVersionModal from "./UploadVersionModal";

// Helper for date formatting
const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RepositoryVersionHistoryPage: React.FC = () => {
  // Extract URL parameters flexibly (supports both :repositoryId and :id)
  const params = useParams<{ repositoryId?: string; id?: string }>();
  const repositoryId = params.repositoryId || params.id;

  const navigate = useNavigate();

  // States
  const [repository, setRepository] = useState<Repository | null>(null);
  const [versions, setVersions] = useState<RepositoryVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Fetch Versions & Repository Details
  const fetchHistoryData = useCallback(async () => {
    if (!repositoryId) {
      setError("Repository ID is missing from the URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [repoData, versionData] = await Promise.all([
        getRepository(repositoryId),
        getRepositoryVersions(repositoryId),
      ]);

      setRepository(repoData);
      setVersions(versionData || []);
    } catch (err: any) {
      console.error("Failed to load version history:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load version history."
      );
    } finally {
      setLoading(false);
    }
  }, [repositoryId]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress sx={{ color: "#7c4dff" }} size={48} />
      </Box>
    );
  }

  return (
    <Box
      sx={{ color: "#ffffff", p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}
    >
      {/* BREADCRUMBS */}
      <Breadcrumbs
        sx={{
          color: "grey.400",
          mb: 2,
          "& .MuiBreadcrumbs-separator": { color: "grey.600" },
        }}
      >
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/repository")}
        >
          Repositories
        </Link>
        {repository && (
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/repository/${repositoryId}`)}
          >
            {repository.name}
          </Link>
        )}
        <Typography color="#ffffff" fontWeight={600}>
          Version History
        </Typography>
      </Breadcrumbs>

      {/* HEADER SECTION */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              repositoryId
                ? navigate(`/repository/${repositoryId}`)
                : navigate("/repository")
            }
            sx={{
              borderColor: "#3e485e",
              color: "#e0e0e0",
              borderRadius: 2,
              textTransform: "none",
              "&:hover": { borderColor: "#7c4dff", bgcolor: "rgba(124, 77, 255, 0.08)" },
            }}
          >
            Back
          </Button>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <HistoryIcon sx={{ color: "#7c4dff" }} />
              <Typography variant="h5" fontWeight={700}>
                Version History
              </Typography>
            </Stack>
            <Typography variant="body2" color="grey.400">
              Track and download previous releases and changelogs
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => setIsUploadModalOpen(true)}
          sx={{
            bgcolor: "#673ab7",
            color: "#fff",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "#5e35b1" },
          }}
        >
          Upload New Release
        </Button>
      </Stack>

      {/* ERROR ALERT */}
      {error && (
        <Alert severity="error" sx={{ bgcolor: "#2c1c1d", color: "#f87171", mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* VERSIONS TABLE */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "#1e2532",
          border: "1px solid #2d3545",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {versions.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#181d28" }}>
                <TableRow>
                  <TableCell sx={{ color: "grey.400", borderColor: "#2d3545" }}>
                    Version
                  </TableCell>
                  <TableCell sx={{ color: "grey.400", borderColor: "#2d3545" }}>
                    Title & Changelog
                  </TableCell>
                  <TableCell sx={{ color: "grey.400", borderColor: "#2d3545" }}>
                    Released At
                  </TableCell>
                  <TableCell align="right" sx={{ color: "grey.400", borderColor: "#2d3545" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versions.map((ver, idx) => {
                  const versionTag = ver.versionNumber || ver.version || "v1.0.0";
                  const isLatest = idx === 0;

                  return (
                    <TableRow key={ver._id || ver.id || idx} hover sx={{ "&:hover": { bgcolor: "rgba(255, 255, 255, 0.02)" } }}>
                      <TableCell sx={{ color: "#fff", borderColor: "#2d3545", verticalAlign: "top" }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            icon={<TagIcon sx={{ fontSize: "14px !important", color: isLatest ? "#00e676" : "#b0bec5" }} />}
                            label={versionTag}
                            size="small"
                            sx={{
                              bgcolor: isLatest ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 255, 255, 0.05)",
                              color: isLatest ? "#00e676" : "#b0bec5",
                              fontWeight: 700,
                            }}
                          />
                          {isLatest && (
                            <Chip label="Latest" size="small" sx={{ bgcolor: "#7c4dff", color: "#fff", height: 20, fontSize: "0.65rem" }} />
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ color: "#fff", borderColor: "#2d3545" }}>
                        <Typography variant="body2" fontWeight={600} mb={0.5}>
                          {ver.title || `Release ${versionTag}`}
                        </Typography>
                        <Typography variant="caption" color="grey.400" display="block">
                          {ver.changelog || "No changelog provided for this version."}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ color: "grey.400", borderColor: "#2d3545", verticalAlign: "top" }}>
                        <Typography variant="body2">{formatDate(ver.createdAt)}</Typography>
                      </TableCell>

                      <TableCell align="right" sx={{ borderColor: "#2d3545", verticalAlign: "top" }}>
                        {ver.archiveUrl ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            component="a"
                            href={ver.archiveUrl}
                            download
                            sx={{
                              borderColor: "#3e485e",
                              color: "#90caf9",
                              textTransform: "none",
                              "&:hover": { borderColor: "#90caf9" },
                            }}
                          >
                            Download
                          </Button>
                        ) : (
                          <Typography variant="caption" color="grey.600">
                            No Archive
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box textAlign="center" py={6} px={3}>
            <HistoryIcon sx={{ fontSize: 48, color: "grey.600", mb: 1 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              No Versions Found
            </Typography>
            <Typography variant="body2" color="grey.400" mb={2}>
              There are no recorded releases for this repository yet.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* UPLOAD MODAL */}
      {repositoryId && (
        <UploadVersionModal
          open={isUploadModalOpen}
          repositoryId={repositoryId}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            fetchHistoryData();
          }}
        />
      )}
    </Box>
  );
};

export default RepositoryVersionHistoryPage;