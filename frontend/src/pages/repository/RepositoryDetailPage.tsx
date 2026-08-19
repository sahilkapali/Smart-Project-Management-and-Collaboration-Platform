import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getIssuesByRepository } from "../../services/issues.service";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BugReportIcon from "@mui/icons-material/BugReport";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckIcon from "@mui/icons-material/Check";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CodeIcon from "@mui/icons-material/Code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import GitHubIcon from "@mui/icons-material/GitHub";
import HistoryIcon from "@mui/icons-material/History";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import StorageIcon from "@mui/icons-material/Storage";
import TagIcon from "@mui/icons-material/Tag";
import TerminalIcon from "@mui/icons-material/Terminal";

import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
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
import type { Issue } from "../../types/issue.types";

// Modals
import UploadVersionModal from "./UploadVersionModal";

// ============================================================
// HELPER FUNCTIONS & UTILS
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

const getFileIcon = (fileName: string = "", type: string = "") => {
  if (type === "folder") {
    return <FolderIcon sx={{ color: "#ffca28", fontSize: 20 }} />;
  }

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  switch (extension) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "py":
    case "java":
    case "cpp":
    case "c":
    case "go":
    case "rs":
    case "html":
    case "css":
    case "scss":
      return <CodeIcon sx={{ color: "#64b5f6", fontSize: 20 }} />;
    case "json":
    case "yml":
    case "yaml":
    case "toml":
    case "env":
    case "config":
      return <TerminalIcon sx={{ color: "#ffd54f", fontSize: 20 }} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
    case "gif":
    case "webp":
      return <ImageIcon sx={{ color: "#81c784", fontSize: 20 }} />;
    case "pdf":
      return <PictureAsPdfIcon sx={{ color: "#e57373", fontSize: 20 }} />;
    case "md":
    case "txt":
    case "doc":
    case "docx":
      return <DescriptionIcon sx={{ color: "#ba68c8", fontSize: 20 }} />;
    default:
      return <InsertDriveFileIcon sx={{ color: "#90caf9", fontSize: 20 }} />;
  }
};

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// ============================================================
// COMPONENT
// ============================================================

const RepositoryDetailPage: React.FC = () => {
  const params = useParams<{ repositoryId?: string; id?: string }>();
  // Safely fallback to an empty string to keep repositoryId strictly typed as 'string'
  const repositoryId: string = params.repositoryId ?? params.id ?? "";

  const navigate = useNavigate();

  // Data States
  const [repository, setRepository] = useState<Repository | null>(null);
  const [versions, setVersions] = useState<RepositoryVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  
  // Issues State
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState<boolean>(false);

  // Navigation & UI States
  const [currentPath, setCurrentPath] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filesLoading, setFilesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Derived state for latest version object
  const latestVersion = useMemo(() => versions[0] || null, [versions]);

  // ==========================================================
  // FETCH REPOSITORY DATA
  // ==========================================================
  const fetchRepositoryData = useCallback(async () => {
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

      const verList = versionsData || [];
      setVersions(verList);

      let targetVersionId = "";
      if (verList.length > 0) {
        const firstVersion = verList[0];
        targetVersionId = firstVersion._id ?? firstVersion.id ?? "";
        setSelectedVersionId(targetVersionId);
      }

      const fileList = await getRepositoryFiles(
        repositoryId,
        targetVersionId || undefined
      );
      setFiles(fileList || []);
    } catch (err: unknown) {
      console.error("Failed to load repository details:", err);
      const apiErr = err as ApiErrorResponse;
      setError(
        apiErr?.response?.data?.message ||
          apiErr?.message ||
          "Failed to load repository details."
      );
    } finally {
      setLoading(false);
    }
  }, [repositoryId]);

  useEffect(() => {
    setCurrentPath("");
    setSearchQuery("");
    fetchRepositoryData();
  }, [fetchRepositoryData]);

  // Fetch files when switching version dropdown
  const handleVersionChange = async (versionId: string) => {
    if (!repositoryId) return;
    try {
      setFilesLoading(true);
      setSelectedVersionId(versionId);
      setCurrentPath("");
      setSearchQuery("");
      const fileList = await getRepositoryFiles(repositoryId, versionId);
      setFiles(fileList || []);
    } catch (err) {
      console.error("Failed to load version files:", err);
    } finally {
      setFilesLoading(false);
    }
  };

  // ==========================================================
  // FETCH ISSUES
  // ==========================================================
  useEffect(() => {
    const fetchIssues = async () => {
      // Only fetch issues if the issues tab is active
      if (!repositoryId || activeTab !== 1) return;
      
      try {
        setIssuesLoading(true);
        const data = await getIssuesByRepository(repositoryId);
        setIssues(data || []);
      } catch (err) {
        console.error("Failed to load issues:", err);
      } finally {
        setIssuesLoading(false);
      }
    };

    fetchIssues();
  }, [repositoryId, activeTab]);

  // ==========================================================
  // COPY ID TO CLIPBOARD
  // ==========================================================
  const handleCopyId = async () => {
    if (!repositoryId) return;
    try {
      if (navigator.clipboard?.writeText) {
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
  const ownerName = useMemo(() => {
    if (
      repository?.createdBy &&
      typeof repository.createdBy === "object" &&
      "name" in repository.createdBy
    ) {
      const createdByObj = repository.createdBy as { name?: string };
      return createdByObj.name ?? "Admin";
    }
    return "Admin";
  }, [repository?.createdBy]);

  const projectName = useMemo(() => {
    if (
      repository?.project &&
      typeof repository.project === "object" &&
      "name" in repository.project
    ) {
      const projectObj = repository.project as { name?: string };
      return projectObj.name ?? "Default Project";
    }
    return "Default Project";
  }, [repository?.project]);

  // Filter and sort files by current path and search query
  const visibleFiles = useMemo(() => {
    const cleanCurrentPath = currentPath.trim().replace(/^\/+|\/+$/g, "");

    return files
      .filter((file) => {
        const filePath = file.path ?? "";
        const cleanFilePath = filePath.trim().replace(/^\/+|\/+$/g, "");

        if (!cleanCurrentPath) {
          return !cleanFilePath.includes("/");
        }

        if (!cleanFilePath.startsWith(`${cleanCurrentPath}/`)) {
          return false;
        }

        const relativePath = cleanFilePath.slice(cleanCurrentPath.length + 1);
        return relativePath.length > 0 && !relativePath.includes("/");
      })
      .filter((file) => {
        if (!searchQuery.trim()) return true;
        const fileName = file.name ?? "";
        return fileName
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim());
      })
      .sort((a, b) => {
        const nameA = a.name ?? "";
        const nameB = b.name ?? "";
        if (a.type === b.type) {
          return nameA.localeCompare(nameB, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        }
        return a.type === "folder" ? -1 : 1;
      });
  }, [files, currentPath, searchQuery]);

  // Render Path Breadcrumbs
  const renderPathBreadcrumbs = () => {
    const pathSegments = currentPath.split("/").filter(Boolean);

    return (
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            const parts = currentPath.split("/").filter(Boolean);
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
                    latestVersion.versionNumber ??
                    latestVersion.version ??
                    "v1.0.0"
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

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <IconButton
              onClick={fetchRepositoryData}
              sx={{
                bgcolor: "#2d3545",
                color: "#fff",
                "&:hover": { bgcolor: "#3e485e" },
              }}
              aria-label="Refresh Repository"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>

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

      {/* GRID LAYOUT */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 320px", lg: "1fr 360px" }}
        gap={3}
      >
        {/* MAIN TAB CONTENT */}
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

          {/* CODE & FILES TAB */}
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
              {/* FILE EXPLORER TOOLBAR */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#181d28",
                  borderBottom: "1px solid #2d3545",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={2}
                >
                  <Box flexGrow={1}>
                    {currentPath ? (
                      renderPathBreadcrumbs()
                    ) : (
                      <Typography variant="subtitle2" color="grey.400">
                        Root Directory
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {/* VERSION SELECTOR DROPDOWN */}
                    {versions.length > 0 && (
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select
                          value={selectedVersionId}
                          onChange={(e) => handleVersionChange(e.target.value)}
                          sx={{
                            color: "#fff",
                            bgcolor: "#1e2532",
                            fontSize: "0.8rem",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#2d3545",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#7c4dff",
                            },
                          }}
                        >
                          {versions.map((ver) => {
                            const verId = ver._id ?? ver.id ?? "";
                            const verLabel =
                              ver.versionNumber ?? ver.version ?? "v1.0.0";
                            return (
                              <MenuItem key={verId} value={verId}>
                                {verLabel}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    )}

                    {/* SEARCH FILTER */}
                    <TextField
                      size="small"
                      placeholder="Filter files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon
                              sx={{ color: "grey.500", fontSize: 18 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        width: { xs: "100%", sm: 180 },
                        "& .MuiInputBase-root": {
                          bgcolor: "#1e2532",
                          color: "#fff",
                          fontSize: "0.8rem",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#2d3545",
                        },
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>

              {filesLoading ? (
                <Box display="flex" justifyContent="center" py={6}>
                  <CircularProgress size={32} sx={{ color: "#7c4dff" }} />
                </Box>
              ) : visibleFiles.length > 0 ? (
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
                      {visibleFiles.map((file) => {
                        const fileKey =
                          file._id ?? file.id ?? file.path ?? file.name ?? "";
                        const fileName = file.name ?? "";
                        const fileType = file.type ?? "";
                        const filePath = file.path ?? "";

                        return (
                          <TableRow
                            key={fileKey}
                            hover
                            sx={{
                              cursor:
                                fileType === "folder" ? "pointer" : "default",
                              "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.03)",
                              },
                            }}
                            onClick={() => {
                              if (fileType === "folder") {
                                setCurrentPath(filePath);
                                setSearchQuery("");
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
                                {getFileIcon(fileName, fileType)}
                                <Typography variant="body2" fontWeight={500}>
                                  {fileName}
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
                                {fileType === "folder"
                                  ? "-"
                                  : formatBytes(file.size)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
                    {searchQuery
                      ? "No matching files found"
                      : "Repository Archive Explorer"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="grey.400"
                    maxWidth={500}
                    mx="auto"
                    mb={3}
                  >
                    {searchQuery
                      ? `No files matching "${searchQuery}" were found in this directory.`
                      : "No expanded source tree found for this version. You can download the full release archive or create a new release version above."}
                  </Typography>
                  {!searchQuery && (
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
                  )}
                </Box>
              )}
            </Paper>
          )}

          {/* ISSUES TAB */}
          {activeTab === 1 && (
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#1e2532",
                border: "1px solid #2d3545",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              {issuesLoading ? (
                <Box display="flex" justifyContent="center" py={6}>
                  <CircularProgress size={32} sx={{ color: "#7c4dff" }} />
                </Box>
              ) : issues.length > 0 ? (
                <TableContainer>
                  <Table sx={{ minWidth: 500 }}>
                    <TableHead sx={{ bgcolor: "#181d28" }}>
                      <TableRow>
                        <TableCell sx={{ color: "grey.400", borderColor: "#2d3545", py: 1.5 }}>
                          Issue Title
                        </TableCell>
                        <TableCell sx={{ color: "grey.400", borderColor: "#2d3545", py: 1.5 }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ color: "grey.400", borderColor: "#2d3545", py: 1.5 }}>
                          Priority
                        </TableCell>
                        <TableCell align="right" sx={{ color: "grey.400", borderColor: "#2d3545", py: 1.5 }}>
                          Created
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow
                          key={issue.id || issue._id}
                          hover
                          sx={{ cursor: "pointer", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.03)" } }}
                          onClick={() => navigate(`/issues/${issue.id || issue._id}`)}
                        >
                          <TableCell sx={{ color: "#fff", borderColor: "#2d3545", py: 1.5, fontWeight: 500 }}>
                            {issue.title}
                          </TableCell>
                          <TableCell sx={{ borderColor: "#2d3545", py: 1.5 }}>
                            <Chip 
                              label={issue.status || "Open"} 
                              size="small" 
                              sx={{ bgcolor: "rgba(124, 77, 255, 0.1)", color: "#b388ff", fontSize: "0.75rem", fontWeight: 600 }} 
                            />
                          </TableCell>
                          <TableCell sx={{ color: "grey.400", borderColor: "#2d3545", py: 1.5 }}>
                            {issue.priority || "Medium"}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "grey.400", borderColor: "#2d3545", py: 1.5 }}>
                            {formatRelativeDate(issue.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={7} px={3}>
                  <BugReportIcon sx={{ fontSize: 48, color: "grey.600", mb: 1 }} />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    No Issues Recorded
                  </Typography>
                  <Typography variant="body2" color="grey.400" mb={3}>
                    Issues linked to this repository will appear here.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<BugReportIcon />}
                    onClick={() => navigate("/issues/new", { state: { repositoryId } })}
                    sx={{
                      borderColor: "#7c4dff",
                      color: "#7c4dff",
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": { bgcolor: "rgba(124, 77, 255, 0.08)" },
                    }}
                  >
                    Create Issue
                  </Button>
                </Box>
              )}
            </Paper>
          )}
        </Box>

        {/* SIDEBAR METADATA */}
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
                {/* REPOSITORY ID */}
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
                      {repositoryId || "N/A"}
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

                {/* TIMESTAMPS */}
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

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  mb={1.5}
                >
                  <Chip
                    label={
                      latestVersion.versionNumber ??
                      latestVersion.version ??
                      "v1.0.0"
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
      {repositoryId ? (
        <UploadVersionModal
          open={isUploadModalOpen}
          repositoryId={repositoryId}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            fetchRepositoryData();
          }}
        />
      ) : null}
    </Box>
  );
};

export default RepositoryDetailPage;