import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BugReportIcon from "@mui/icons-material/BugReport";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckIcon from "@mui/icons-material/Check";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CodeIcon from "@mui/icons-material/Code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FolderIcon from "@mui/icons-material/Folder";
import GitHubIcon from "@mui/icons-material/GitHub";
import HistoryIcon from "@mui/icons-material/History";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import StorageIcon from "@mui/icons-material/Storage";
import TagIcon from "@mui/icons-material/Tag";
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";

// Services
import {
  getRepository,
  getRepositoryFiles,
  getRepositoryVersions,
} from "../../services/repository.service";

// Types
import type {
  Repository,
  RepositoryFile,
  RepositoryVersion,
} from "../../types/repository.types";

// Modals
import UploadVersionModal from "./UploadVersionModal";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const formatRelativeDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatBytes = (bytes?: number): string => {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ============================================================
// COMPONENT
// ============================================================

const RepositoryDetailPage: React.FC = () => {
  // Extract URL parameters flexibly (supports both :repositoryId and :id)
  const params = useParams<{ repositoryId?: string; id?: string }>();
  const repositoryId = params.repositoryId || params.id;

  const navigate = useNavigate();

  // Data States
  const [repository, setRepository] = useState<Repository | null>(null);
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [latestVersion, setLatestVersion] = useState<RepositoryVersion | null>(
    null
  );

  // Navigation & UI States
  const [currentPath, setCurrentPath] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // ==========================================================
  // FETCH REPOSITORY DATA
  // ==========================================================
  const fetchRepositoryData = useCallback(async () => {
    // 1. Check if ID exists; if not, disable loading and show error
    if (!repositoryId) {
      setError("Invalid route: Repository ID is missing from the URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [repoData, versionsData] = await Promise.all([
        getRepository(repositoryId),
        getRepositoryVersions(repositoryId),
      ]);

      setRepository(repoData);

      if (versionsData && versionsData.length > 0) {
        setLatestVersion(versionsData[0]);
        const targetVersionId = versionsData[0]._id || versionsData[0].id;
        const fileList = await getRepositoryFiles(
          repositoryId,
          targetVersionId
        );
        setFiles(fileList);
      } else {
        const fileList = await getRepositoryFiles(repositoryId);
        setFiles(fileList);
      }
    } catch (err: any) {
      console.error("Failed to load repository details:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load repository details."
      );
    } finally {
      // 2. Guaranteed to stop spinner on success OR failure
      setLoading(false);
    }
  }, [repositoryId]);

  useEffect(() => {
    fetchRepositoryData();
  }, [fetchRepositoryData]);

  // ==========================================================
  // COPY ID TO CLIPBOARD
  // ==========================================================
  const handleCopyId = async () => {
    if (!repositoryId) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(repositoryId);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = repositoryId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error("Failed to copy repository ID:", err);
    }
  };

  // Safe Owner & Project Name Extraction
  const ownerName =
    repository?.createdBy &&
    typeof repository.createdBy === "object" &&
    "name" in repository.createdBy
      ? (repository.createdBy as { name: string }).name
      : "Admin";

  const projectName =
    repository?.project &&
    typeof repository.project === "object" &&
    "name" in repository.project
      ? repository.project.name
      : "Default Project";

  // Filter and sort files by folder path (Folders first, then files)
  const visibleFiles = files
    .filter((file) => {
      if (!currentPath) {
        return !file.path.includes("/") || file.path.split("/").length === 1;
      }
      return (
        file.path.startsWith(`${currentPath}/`) &&
        file.path.replace(`${currentPath}/`, "").split("/").length === 1
      );
    })
    .sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === "folder" ? -1 : 1;
    });

  // Render Path Breadcrumbs for File Navigation
  const renderPathBreadcrumbs = () => {
    if (!currentPath) return null;
    const pathSegments = currentPath.split("/").filter(Boolean);

    return (
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            const parts = currentPath.split("/");
            parts.pop();
            setCurrentPath(parts.join("/"));
          }}
          sx={{ color: "#7c4dff", textTransform: "none", mr: 1 }}
        >
          Back
        </Button>
        <Breadcrumbs
          separator="/"
          sx={{
            color: "grey.400",
            fontSize: "0.875rem",
            "& .MuiBreadcrumbs-separator": { color: "grey.600" },
          }}
        >
          <Link
            underline="hover"
            color="#7c4dff"
            sx={{ cursor: "pointer", fontWeight: 600 }}
            onClick={() => setCurrentPath("")}
          >
            root
          </Link>
          {pathSegments.map((segment, index) => {
            const segmentPath = pathSegments.slice(0, index + 1).join("/");
            const isLast = index === pathSegments.length - 1;

            return isLast ? (
              <Typography
                key={segmentPath}
                color="#ffffff"
                fontWeight={600}
                variant="body2"
              >
                {segment}
              </Typography>
            ) : (
              <Link
                key={segmentPath}
                underline="hover"
                color="#7c4dff"
                sx={{ cursor: "pointer" }}
                onClick={() => setCurrentPath(segmentPath)}
              >
                {segment}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Stack>
    );
  };

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

  if (error || !repository) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ bgcolor: "#2c1c1d", color: "#f87171" }}>
          {error || "Repository not found."}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/repository")}
          sx={{ mt: 2, color: "#7c4dff" }}
        >
          Back to Repositories
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{ color: "#ffffff", p: { xs: 2, md: 3 }, maxWidth: 1400, mx: "auto" }}
    >
      {/* PAGE BREADCRUMBS */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Breadcrumbs
          sx={{
            color: "grey.400",
            "& .MuiBreadcrumbs-separator": { color: "grey.600" },
          }}
        >
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
            onClick={() => navigate("/repository")}
          >
            Repositories
          </Link>
          <Typography color="#ffffff" fontWeight={600}>
            {repository.name}
          </Typography>
        </Breadcrumbs>
      </Stack>

      {/* HEADER CARD */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "#1e2532",
          border: "1px solid #2d3545",
          borderRadius: 3,
          p: 3,
          mb: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              flexWrap="wrap"
            >
              <Typography variant="h5" fontWeight={700}>
                {repository.name}
              </Typography>

              <Chip
                label="Repository"
                size="small"
                icon={
                  <StorageIcon
                    sx={{ fontSize: "14px !important", color: "#9e9e9e" }}
                  />
                }
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  color: "#b0bec5",
                  fontSize: "0.75rem",
                }}
              />

              <Chip
                label={`Project: ${projectName}`}
                size="small"
                sx={{
                  bgcolor: "rgba(124, 77, 255, 0.15)",
                  color: "#b388ff",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />

              {latestVersion && (
                <Chip
                  icon={
                    <TagIcon
                      sx={{ fontSize: "14px !important", color: "#00e676" }}
                    />
                  }
                  label={
                    latestVersion.versionNumber || latestVersion.version
                  }
                  size="small"
                  sx={{
                    bgcolor: "rgba(0, 230, 118, 0.1)",
                    color: "#00e676",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                />
              )}
            </Stack>

            <Typography variant="body2" color="grey.400" mt={1}>
              {repository.description ||
                "No description provided for this repository."}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            {repository.githubUrl && (
              <IconButton
                component="a"
                href={repository.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  bgcolor: "#2d3545",
                  color: "#fff",
                  "&:hover": { bgcolor: "#3e485e" },
                }}
                aria-label="GitHub Repository"
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
            )}

            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => navigate(`/repository/${repositoryId}/history`)}
              sx={{
                borderColor: "#3e485e",
                color: "#e0e0e0",
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#7c4dff",
                  bgcolor: "rgba(124, 77, 255, 0.08)",
                },
              }}
            >
              Version History
            </Button>

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
              New Release
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 2-COLUMN LAYOUT VIA CSS GRID */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 320px", lg: "1fr 360px" }}
        gap={3}
      >
        {/* LEFT COLUMN: MAIN CONTENT */}
        <Box minWidth={0}>
          <Box sx={{ borderBottom: 1, borderColor: "#2d3545", mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                "& .MuiTab-root": {
                  color: "grey.400",
                  textTransform: "none",
                  fontWeight: 600,
                },
                "& .Mui-selected": { color: "#7c4dff" },
                "& .MuiTabs-indicator": { backgroundColor: "#7c4dff" },
              }}
            >
              <Tab
                icon={<CodeIcon fontSize="small" />}
                iconPosition="start"
                label="Code & Files"
              />
              <Tab
                icon={<BugReportIcon fontSize="small" />}
                iconPosition="start"
                label="Issues"
              />
            </Tabs>
          </Box>

          {/* TAB 0: CODE & FILES */}
          {activeTab === 0 && (
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#1e2532",
                border: "1px solid #2d3545",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              {currentPath && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#181d28",
                    borderBottom: "1px solid #2d3545",
                  }}
                >
                  {renderPathBreadcrumbs()}
                </Box>
              )}

              {visibleFiles.length > 0 ? (
                <TableContainer>
                  <Table sx={{ minWidth: 500 }}>
                    <TableHead sx={{ bgcolor: "#181d28" }}>
                      <TableRow>
                        <TableCell
                          sx={{
                            color: "grey.400",
                            borderColor: "#2d3545",
                            py: 1.5,
                          }}
                        >
                          Name
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "grey.400",
                            borderColor: "#2d3545",
                            py: 1.5,
                          }}
                        >
                          Last Modified
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: "grey.400",
                            borderColor: "#2d3545",
                            py: 1.5,
                          }}
                        >
                          Size
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleFiles.map((file) => (
                        <TableRow
                          key={file._id || file.id || file.path || file.name}
                          hover
                          sx={{
                            cursor:
                              file.type === "folder" ? "pointer" : "default",
                            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)" },
                          }}
                          onClick={() => {
                            if (file.type === "folder") {
                              setCurrentPath(file.path);
                            }
                          }}
                        >
                          <TableCell
                            sx={{
                              color: "#fff",
                              borderColor: "#2d3545",
                              py: 1.5,
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1.5}
                            >
                              {file.type === "folder" ? (
                                <FolderIcon
                                  sx={{ color: "#ffca28", fontSize: 20 }}
                                />
                              ) : (
                                <InsertDriveFileIcon
                                  sx={{ color: "#90caf9", fontSize: 20 }}
                                />
                              )}
                              <Typography variant="body2" fontWeight={500}>
                                {file.name}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell
                            sx={{
                              color: "grey.400",
                              borderColor: "#2d3545",
                              py: 1.5,
                            }}
                          >
                            <Tooltip
                              title={
                                file.updatedAt
                                  ? new Date(file.updatedAt).toLocaleString()
                                  : "N/A"
                              }
                            >
                              <Typography variant="body2">
                                {formatRelativeDate(file.updatedAt)}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              color: "grey.400",
                              borderColor: "#2d3545",
                              py: 1.5,
                            }}
                          >
                            <Typography variant="body2">
                              {file.type === "folder"
                                ? "-"
                                : formatBytes(file.size)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={7} px={3}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      bgcolor: "rgba(124, 77, 255, 0.1)",
                      p: 2,
                      borderRadius: "50%",
                      mb: 2,
                    }}
                  >
                    <CodeIcon sx={{ fontSize: 40, color: "#7c4dff" }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Repository Archive Explorer
                  </Typography>
                  <Typography
                    variant="body2"
                    color="grey.400"
                    maxWidth={500}
                    mx="auto"
                    mb={3}
                  >
                    No expanded source tree found for this version. You can
                    download the full release archive or create a new release
                    version above.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setIsUploadModalOpen(true)}
                    sx={{
                      borderColor: "#7c4dff",
                      color: "#7c4dff",
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": { bgcolor: "rgba(124, 77, 255, 0.08)" },
                    }}
                  >
                    Upload Release Package
                  </Button>
                </Box>
              )}
            </Paper>
          )}

          {/* TAB 1: ISSUES */}
          {activeTab === 1 && (
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#1e2532",
                border: "1px solid #2d3545",
                borderRadius: 3,
                p: 5,
                textAlign: "center",
              }}
            >
              <BugReportIcon sx={{ fontSize: 48, color: "grey.600", mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                No Issues Recorded
              </Typography>
              <Typography variant="body2" color="grey.400">
                Issues linked to this repository will appear here.
              </Typography>
            </Paper>
          )}
        </Box>

        {/* RIGHT COLUMN: SIDEBAR METADATA */}
        <Box>
          <Stack spacing={2.5}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#1e2532",
                border: "1px solid #2d3545",
                borderRadius: 3,
                p: 2.5,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Repository Details
              </Typography>

              <Stack
                spacing={2}
                divider={<Divider sx={{ borderColor: "#2d3545" }} />}
              >
                {/* REPOSITORY ID WITH COPY BUTTON */}
                <Box>
                  <Typography
                    variant="caption"
                    color="grey.400"
                    display="block"
                    gutterBottom
                  >
                    Repository ID
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        bgcolor: "#181d28",
                        p: 0.8,
                        borderRadius: 1,
                        fontSize: "0.8rem",
                        color: "#b0bec5",
                        flexGrow: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {repositoryId}
                    </Typography>
                    <Tooltip title={copiedId ? "Copied!" : "Copy ID"}>
                      <IconButton
                        size="small"
                        onClick={handleCopyId}
                        sx={{
                          bgcolor: "#2d3545",
                          color: copiedId ? "#00e676" : "#fff",
                        }}
                        aria-label="Copy Repository ID"
                      >
                        {copiedId ? (
                          <CheckIcon fontSize="small" />
                        ) : (
                          <ContentCopyIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {/* CREATED BY */}
                <Box>
                  <Typography
                    variant="caption"
                    color="grey.400"
                    display="block"
                    mb={0.5}
                  >
                    Created By
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: "#7c4dff",
                        fontSize: "0.8rem",
                      }}
                    >
                      {ownerName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>
                      {ownerName}
                    </Typography>
                  </Stack>
                </Box>

                {/* RELATIVE TIMESTAMPS */}
                <Box>
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarTodayIcon
                        sx={{ fontSize: 16, color: "grey.500" }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          color="grey.400"
                          display="block"
                        >
                          Created
                        </Typography>
                        <Tooltip
                          title={
                            repository.createdAt
                              ? new Date(repository.createdAt).toLocaleString()
                              : "N/A"
                          }
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {formatRelativeDate(repository.createdAt)}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <HistoryIcon sx={{ fontSize: 16, color: "grey.500" }} />
                      <Box>
                        <Typography
                          variant="caption"
                          color="grey.400"
                          display="block"
                        >
                          Last Updated
                        </Typography>
                        <Tooltip
                          title={
                            repository.updatedAt
                              ? new Date(repository.updatedAt).toLocaleString()
                              : "N/A"
                          }
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {formatRelativeDate(repository.updatedAt)}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* LATEST RELEASE CARD */}
            {latestVersion && (
              <Paper
                elevation={0}
                sx={{
                  bgcolor: "#1e2532",
                  border: "1px solid #2d3545",
                  borderRadius: 3,
                  p: 2.5,
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                  Latest Release
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <Chip
                    label={
                      latestVersion.versionNumber || latestVersion.version
                    }
                    size="small"
                    sx={{ bgcolor: "#7c4dff", color: "#fff", fontWeight: 700 }}
                  />
                  <Typography variant="caption" color="grey.400">
                    {formatRelativeDate(latestVersion.createdAt)}
                  </Typography>
                </Stack>

                <Typography variant="body2" fontWeight={600} gutterBottom>
                  {latestVersion.title}
                </Typography>

                {latestVersion.changelog && (
                  <Typography
                    variant="caption"
                    color="grey.400"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 2,
                    }}
                  >
                    {latestVersion.changelog}
                  </Typography>
                )}

                {latestVersion.archiveUrl && (
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    component="a"
                    href={latestVersion.archiveUrl}
                    download
                    sx={{
                      mt: 1,
                      borderColor: "#3e485e",
                      color: "#90caf9",
                      textTransform: "none",
                      "&:hover": { borderColor: "#90caf9" },
                    }}
                  >
                    Download Package
                  </Button>
                )}
              </Paper>
            )}
          </Stack>
        </Box>
      </Box>

      {/* UPLOAD VERSION MODAL */}
      {repositoryId && (
        <UploadVersionModal
          open={isUploadModalOpen}
          repositoryId={repositoryId}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            fetchRepositoryData();
          }}
        />
      )}
    </Box>
  );
};

export default RepositoryDetailPage;