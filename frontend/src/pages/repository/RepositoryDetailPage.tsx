import React, { useCallback, useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";

// ============================================================
// ICONS
// ============================================================

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import CodeIcon from "@mui/icons-material/Code";

import BugReportIcon from "@mui/icons-material/BugReport";

import LockIcon from "@mui/icons-material/Lock";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import GitHubIcon from "@mui/icons-material/GitHub";

import HistoryIcon from "@mui/icons-material/History";

import DescriptionIcon from "@mui/icons-material/Description";

// ============================================================
// SERVICES
// ============================================================

import { getRepositoryById } from "../../services/repository.service";

// ============================================================
// TYPES
// ============================================================

import type { Repository } from "../../types/repository.types";

// ============================================================
// MODAL
// ============================================================

import UploadVersionModal from "./UploadVersionModal";

// ============================================================
// COMPONENT
// ============================================================

const RepositoryDetailPage: React.FC = () => {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [activeTab, setActiveTab] = useState(0);

  const [repository, setRepository] = useState<Repository | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // ==========================================================
  // REPOSITORY ID
  // ==========================================================

  const repositoryId = repository?._id || id || "";

  // ==========================================================
  // GITHUB URL
  // ==========================================================

  const githubUrl = repository?.githubUrl || "";

  // ==========================================================
  // COPY GITHUB URL
  // ==========================================================

  const handleCopyGithubUrl = async () => {
    if (!githubUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(githubUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy GitHub URL:", error);
    }
  };

  // ==========================================================
  // FETCH REPOSITORY
  // ==========================================================

  const fetchRepositoryDetails = useCallback(async () => {
    if (!id) {
      setError("Repository ID is missing.");

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setError(null);

      const repoData = await getRepositoryById(id);

      setRepository(repoData);
    } catch (err: any) {
      console.error("Failed to load repository:", err);

      setError(
        err?.response?.data?.message || "Failed to fetch repository details.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchRepositoryDetails();
  }, [fetchRepositoryDetails]);

  // ==========================================================
  // HANDLE VERSION UPLOAD SUCCESS
  // ==========================================================

  const handleVersionUploadSuccess = async () => {
    setIsUploadModalOpen(false);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !repository) {
    return (
      <Box p={4} maxWidth={1200} mx="auto">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Repository not found."}
        </Alert>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/repository")}
        >
          Back to Repositories
        </Button>
      </Box>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 4,
        },

        maxWidth: 1200,

        mx: "auto",
      }}
    >
      {/* ======================================================
          BACK BUTTON
      ====================================================== */}

      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/repository")}
          sx={{
            textTransform: "none",
          }}
        >
          Back to Repositories
        </Button>
      </Stack>

      {/* ======================================================
          BREADCRUMB
      ====================================================== */}

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate("/repository")}
        >
          Repositories
        </Link>

        <Typography color="text.primary">{repository.name}</Typography>
      </Breadcrumbs>

      {/* ======================================================
          REPOSITORY HEADER
      ====================================================== */}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            spacing={3}
          >
            {/* ==================================================
                REPOSITORY INFORMATION
            ================================================== */}

            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                mb={1}
                flexWrap="wrap"
              >
                <Typography variant="h5" fontWeight="bold">
                  {repository.name}
                </Typography>

                <Chip
                  size="small"
                  icon={
                    <LockIcon
                      sx={{
                        fontSize: 14,
                      }}
                    />
                  }
                  label="Repository"
                  variant="outlined"
                />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {repository.description || "No description provided."}
              </Typography>

              {repository.project && (
                <Chip
                  size="small"
                  label="Project Repository"
                  variant="outlined"
                  sx={{
                    mt: 1.5,
                  }}
                />
              )}
            </Box>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
              alignItems={{
                xs: "stretch",
                sm: "center",
              }}
            >
              {/* =================================================
                  GITHUB URL
              ================================================= */}

              {githubUrl && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: "4px 8px",

                    display: "flex",

                    alignItems: "center",

                    bgcolor: "action.hover",

                    borderRadius: 2,

                    maxWidth: {
                      xs: "100%",
                      sm: 400,
                    },
                  }}
                >
                  <GitHubIcon
                    fontSize="small"
                    sx={{
                      mr: 1,
                    }}
                  />

                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",

                      px: 1,

                      overflow: "hidden",

                      textOverflow: "ellipsis",

                      whiteSpace: "nowrap",
                    }}
                  >
                    {githubUrl}
                  </Typography>

                  <Tooltip title={copied ? "Copied!" : "Copy GitHub URL"}>
                    <IconButton size="small" onClick={handleCopyGithubUrl}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Paper>
              )}

              {/* =================================================
                  OPEN GITHUB
              ================================================= */}

              {githubUrl && (
                <Button
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  component="a"
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    textTransform: "none",

                    borderRadius: 2,
                  }}
                >
                  GitHub
                </Button>
              )}

              {/* =================================================
                  VERSION HISTORY
              ================================================= */}

              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={() => navigate(`/repository/${repositoryId}/versions`)}
                sx={{
                  textTransform: "none",

                  borderRadius: 2,
                }}
              >
                Version History
              </Button>

              {/* =================================================
                  CREATE RELEASE
              ================================================= */}

              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setIsUploadModalOpen(true)}
                sx={{
                  textTransform: "none",

                  borderRadius: 2,
                }}
              >
                New Release
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ======================================================
          TABS
      ====================================================== */}

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",

          mb: 3,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab icon={<CodeIcon />} iconPosition="start" label="Code & Files" />

          <Tab icon={<BugReportIcon />} iconPosition="start" label="Issues" />
        </Tabs>
      </Box>

      {/* ======================================================
          CODE TAB
      ====================================================== */}

      {activeTab === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 3,
              md: 5,
            },

            borderRadius: 3,

            textAlign: "center",
          }}
        >
          <CodeIcon
            sx={{
              fontSize: 60,
              color: "text.secondary",

              mb: 2,
            }}
          />

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Repository File Explorer
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            maxWidth={600}
            mx="auto"
            mb={3}
          >
            The repository metadata is available, but individual source-file
            management is being implemented separately. The current backend does
            not yet expose a file explorer API, so this interface does not
            pretend that files are available when they are not.
          </Typography>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="center"
            spacing={2}
          >
            <Button variant="outlined" startIcon={<DescriptionIcon />} disabled>
              File Explorer Coming Next
            </Button>

            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => navigate(`/repository/${repositoryId}/versions`)}
            >
              View Releases
            </Button>
          </Stack>
        </Paper>
      )}

      {/* ======================================================
          ISSUES TAB
      ====================================================== */}

      {activeTab === 1 && (
        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 3,
              md: 5,
            },

            borderRadius: 3,

            textAlign: "center",
          }}
        >
          <BugReportIcon
            sx={{
              fontSize: 60,
              color: "text.secondary",

              mb: 2,
            }}
          />

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Repository Issues
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            maxWidth={600}
            mx="auto"
            mb={3}
          >
            Issue tracking will be connected to the project's central Issue
            Tracking module. The repository page currently does not call a
            nonexistent repository-specific issues endpoint.
          </Typography>

          <Button
            variant="contained"
            startIcon={<BugReportIcon />}
            onClick={() => navigate("/issues")}
          >
            Open Issue Tracker
          </Button>
        </Paper>
      )}

      {/* ======================================================
          REPOSITORY INFORMATION
      ====================================================== */}

      <Card
        variant="outlined"
        sx={{
          mt: 3,
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Repository Information
          </Typography>

          <Divider
            sx={{
              mb: 2,
            }}
          />

          <Stack spacing={1.5}>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
            >
              <Typography fontWeight="bold">Repository ID:</Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontFamily: "monospace",
                }}
              >
                {repository._id}
              </Typography>
            </Stack>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
            >
              <Typography fontWeight="bold">Created:</Typography>

              <Typography color="text.secondary">
                {repository.createdAt
                  ? new Date(repository.createdAt).toLocaleString()
                  : "N/A"}
              </Typography>
            </Stack>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
            >
              <Typography fontWeight="bold">Last Updated:</Typography>

              <Typography color="text.secondary">
                {repository.updatedAt
                  ? new Date(repository.updatedAt).toLocaleString()
                  : "N/A"}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ======================================================
          VERSION UPLOAD MODAL
      ====================================================== */}

      <UploadVersionModal
        open={isUploadModalOpen}
        repositoryId={repositoryId}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleVersionUploadSuccess}
      />
    </Box>
  );
};

export default RepositoryDetailPage;
