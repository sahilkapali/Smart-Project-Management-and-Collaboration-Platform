import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BugReportIcon from "@mui/icons-material/BugReport";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CodeIcon from "@mui/icons-material/Code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DescriptionIcon from "@mui/icons-material/Description";
import GitHubIcon from "@mui/icons-material/GitHub";
import HistoryIcon from "@mui/icons-material/History";
import LockIcon from "@mui/icons-material/Lock";
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
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";

import { getRepositoryById } from "../../services/repository.service";
import type { Repository } from "../../types/repository.types";

import UploadVersionModal from "./UploadVersionModal";

const RepositoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================
  const [activeTab, setActiveTab] = useState<number>(0);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derived values
  const repositoryId = repository?._id || repository?.id || id || "";
  const githubUrl = repository?.githubUrl || "";
  const projectName =
    repository?.project && typeof repository.project === "object"
      ? repository.project.name
      : null;

  // ==========================================================
  // COPY GITHUB URL
  // ==========================================================
  const handleCopyGithubUrl = async () => {
    if (!githubUrl) return;

    try {
      await navigator.clipboard.writeText(githubUrl);
      setCopied(true);
      setToastMessage("GitHub URL copied to clipboard!");

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy GitHub URL:", err);
    }
  };

  // ==========================================================
  // FETCH REPOSITORY DETAILS
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

  useEffect(() => {
    fetchRepositoryDetails();
  }, [fetchRepositoryDetails]);

  // ==========================================================
  // HANDLE VERSION UPLOAD SUCCESS
  // ==========================================================
  const handleVersionUploadSuccess = async () => {
    setIsUploadModalOpen(false);
    setToastMessage("New release uploaded successfully!");
    await fetchRepositoryDetails();
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress sx={{ color: "#5e35b1" }} />
      </Box>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================
  if (error || !repository) {
    return (
      <Box p={4} maxWidth={1200} mx="auto">
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error || "Repository not found."}
        </Alert>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/repository")}
          sx={{ textTransform: "none" }}
        >
          Back to Repositories
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      {/* NAVIGATION & BREADCRUMBS */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/repository")}
          sx={{ textTransform: "none" }}
        >
          Back to Repositories
        </Button>
      </Stack>

      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate("/repository")}
        >
          Repositories
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          {repository.name}
        </Typography>
      </Breadcrumbs>

      {/* REPOSITORY HEADER CARD */}
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={3}
          >
            {/* LEFT: TITLE & META */}
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
                  icon={<LockIcon sx={{ fontSize: 14 }} />}
                  label="Repository"
                  variant="outlined"
                />

                {projectName && (
                  <Chip
                    size="small"
                    label={`Project: ${projectName}`}
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {repository.description || "No description provided."}
              </Typography>
            </Box>

            {/* RIGHT: ACTIONS */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              {githubUrl && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: "4px 8px",
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "action.hover",
                    borderRadius: 2,
                    maxWidth: { xs: "100%", sm: 300 },
                  }}
                >
                  <GitHubIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
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

                  <Tooltip title={copied ? "Copied!" : "Copy URL"}>
                    <IconButton size="small" onClick={handleCopyGithubUrl}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Paper>
              )}

              {githubUrl && (
                <Button
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  component="a"
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  GitHub
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={() => navigate(`/repository/${repositoryId}/versions`)}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Version History
              </Button>

              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setIsUploadModalOpen(true)}
                sx={{
                  bgcolor: "#5e35b1",
                  textTransform: "none",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#4527a0" },
                }}
              >
                New Release
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* TABS */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab icon={<CodeIcon />} iconPosition="start" label="Code & Files" />
          <Tab icon={<BugReportIcon />} iconPosition="start" label="Issues" />
        </Tabs>
      </Box>

      {/* CODE & FILES TAB */}
      {activeTab === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <CodeIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
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
            management is being implemented separately. Archive version
            downloads are available through the releases section.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="center"
            spacing={2}
          >
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              disabled
              sx={{ borderRadius: 2 }}
            >
              File Explorer Coming Soon
            </Button>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => navigate(`/repository/${repositoryId}/versions`)}
              sx={{ borderRadius: 2 }}
            >
              View Releases
            </Button>
          </Stack>
        </Paper>
      )}

      {/* ISSUES TAB */}
      {activeTab === 1 && (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <BugReportIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
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
            Issue tracking is integrated directly within the main Issue Tracking
            module.
          </Typography>

          <Button
            variant="contained"
            startIcon={<BugReportIcon />}
            onClick={() => navigate("/issues")}
            sx={{
              bgcolor: "#5e35b1",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { bgcolor: "#4527a0" },
            }}
          >
            Open Issue Tracker
          </Button>
        </Paper>
      )}

      {/* METADATA INFO CARD */}
      <Card variant="outlined" sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Repository Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.5}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Typography fontWeight="bold" minWidth={140}>
                Repository ID:
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontFamily: "monospace" }}
              >
                {repository._id || repository.id}
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Typography fontWeight="bold" minWidth={140}>
                Created At:
              </Typography>
              <Typography color="text.secondary">
                {repository.createdAt
                  ? new Date(repository.createdAt).toLocaleString()
                  : "N/A"}
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Typography fontWeight="bold" minWidth={140}>
                Last Updated:
              </Typography>
              <Typography color="text.secondary">
                {repository.updatedAt
                  ? new Date(repository.updatedAt).toLocaleString()
                  : "N/A"}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* UPLOAD VERSION MODAL */}
      <UploadVersionModal
        open={isUploadModalOpen}
        repositoryId={repositoryId}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleVersionUploadSuccess}
      />

      {/* TOAST NOTIFICATION */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Box>
  );
};

export default RepositoryDetailPage;
