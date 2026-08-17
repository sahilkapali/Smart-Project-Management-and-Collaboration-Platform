import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Breadcrumbs,
  Link,
} from "@mui/material";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CodeIcon from "@mui/icons-material/Code";
import BugReportIcon from "@mui/icons-material/BugReport";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import ArticleIcon from "@mui/icons-material/Article";
import SubdirectoryArrowLeftIcon from "@mui/icons-material/SubdirectoryArrowLeft";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Services & Types
import {
  getRepositoryById,
  getRepositoryFiles,
  getRepositoryIssues,
} from "../../services/repository.service";
import type {
  FileNode,
  RepositoryIssue,
  Repository,
} from "../../types/repository.types";

// Modals
import UploadVersionModal from "./UploadVersionModal";

const RepositoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [issues, setIssues] = useState<RepositoryIssue[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  // Folder Navigation States
  const [currentPath, setCurrentPath] = useState<string>("");
  const [filesLoading, setFilesLoading] = useState<boolean>(false);

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cloneUrl =
    repository?.cloneUrl ||
    repository?.gitUrl ||
    `${window.location.origin}/git/${
      repository?.name?.toLowerCase().replace(/\s+/g, "-") || id
    }.git`;

  const handleCopyCloneUrl = () => {
    navigator.clipboard.writeText(cloneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Centralized Fetch function for initial load and refreshing state
  const fetchRepositoryDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const [repoData, filesData, issuesData] = await Promise.all([
        getRepositoryById(id),
        getRepositoryFiles(id, "").catch(() => []),
        getRepositoryIssues(id).catch(() => []),
      ]);

      setRepository(repoData);
      setFiles(Array.isArray(filesData) ? filesData : []);
      setIssues(Array.isArray(issuesData) ? issuesData : []);

      const readme = (Array.isArray(filesData) ? filesData : []).find(
        (f: FileNode) => f.name.toLowerCase() === "readme.md",
      );
      setSelectedFile(readme || filesData[0] || null);
    } catch (err: any) {
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

  // Fetch Directory Contents by Path
  const fetchDirectory = async (path: string) => {
    if (!id) return;
    try {
      setFilesLoading(true);
      const res = await getRepositoryFiles(id, path);
      setFiles(Array.isArray(res) ? res : []);
      setCurrentPath(path);
    } catch (err) {
      console.error("Failed to load directory content", err);
    } finally {
      setFilesLoading(false);
    }
  };

  // Handle File / Folder Clicks
  const handleNodeClick = (node: FileNode) => {
    if (node.type === "folder") {
      const nextPath = currentPath ? `${currentPath}/${node.name}` : node.name;
      fetchDirectory(nextPath);
    } else {
      setSelectedFile(node);
    }
  };

  // Handle Breadcrumb Segment Navigation
  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      fetchDirectory("");
      return;
    }
    const segments = currentPath.split("/").filter(Boolean);
    const targetPath = segments.slice(0, index + 1).join("/");
    fetchDirectory(targetPath);
  };

  // Navigate Up One Directory Level
  const handleNavigateUp = () => {
    const segments = currentPath.split("/").filter(Boolean);
    segments.pop();
    fetchDirectory(segments.join("/"));
  };

  // Handle Success Callback After Version Upload
  const handleUploadSuccess = () => {
    fetchRepositoryDetails();
    if (currentPath !== "") {
      fetchDirectory(currentPath);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

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

  const isPrivate = repository.visibility !== "public";
  const pathSegments = currentPath.split("/").filter(Boolean);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* Navigation Breadcrumb */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/repository")}
          sx={{ textTransform: "none" }}
        >
          Back to Repositories
        </Button>
      </Stack>

      {/* Header Info */}
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                <Typography variant="h5" fontWeight="bold">
                  {repository.name}
                </Typography>
                <Chip
                  size="small"
                  icon={
                    isPrivate ? (
                      <LockIcon style={{ fontSize: 13 }} />
                    ) : (
                      <PublicIcon style={{ fontSize: 13 }} />
                    )
                  }
                  label={isPrivate ? "Private" : "Public"}
                  variant="outlined"
                />
                {repository.language && (
                  <Chip
                    size="small"
                    icon={<CodeIcon style={{ fontSize: 13 }} />}
                    label={repository.language}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {repository.description || "No description provided."}
              </Typography>
            </Box>

            {/* Quick Actions & Clone URL */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems="center"
            >
              <Paper
                variant="outlined"
                sx={{
                  p: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "action.hover",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontFamily: "monospace", px: 1 }}
                >
                  {cloneUrl}
                </Typography>
                <Tooltip title={copied ? "Copied!" : "Copy Clone URL"}>
                  <IconButton size="small" onClick={handleCopyCloneUrl}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Paper>

              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setIsUploadModalOpen(true)}
                sx={{
                  bgcolor: "#5e35b1",
                  textTransform: "none",
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: "#4527a0" },
                }}
              >
                Upload Version
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Tab Controls */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="Repository navigation tabs"
        >
          <Tab icon={<CodeIcon />} iconPosition="start" label="Code & Files" />
          <Tab
            icon={<BugReportIcon />}
            iconPosition="start"
            label={`Issues (${issues.length})`}
          />
        </Tabs>
      </Box>

      {/* TAB 1: CODE & FILE BROWSER */}
      {activeTab === 0 && (
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          {/* File Tree Explorer */}
          <Card variant="outlined" sx={{ borderRadius: 3, flex: 1 }}>
            <CardContent sx={{ p: 0 }}>
              {/* Directory Path Breadcrumbs Header */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "action.hover",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Breadcrumbs separator="/" aria-label="file path navigation">
                  <Link
                    component="button"
                    underline="hover"
                    color={currentPath === "" ? "text.primary" : "inherit"}
                    fontWeight={currentPath === "" ? 700 : 400}
                    onClick={() => handleBreadcrumbClick(-1)}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    root
                  </Link>
                  {pathSegments.map((segment, index) => {
                    const isLast = index === pathSegments.length - 1;
                    return isLast ? (
                      <Typography
                        key={segment + index}
                        color="text.primary"
                        fontWeight={700}
                        fontSize="0.875rem"
                      >
                        {segment}
                      </Typography>
                    ) : (
                      <Link
                        key={segment + index}
                        component="button"
                        underline="hover"
                        color="inherit"
                        fontSize="0.875rem"
                        onClick={() => handleBreadcrumbClick(index)}
                      >
                        {segment}
                      </Link>
                    );
                  })}
                </Breadcrumbs>
              </Box>

              {filesLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <List disablePadding>
                  {/* Up One Level Button */}
                  {currentPath !== "" && (
                    <ListItemButton
                      onClick={handleNavigateUp}
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <SubdirectoryArrowLeftIcon
                          color="action"
                          fontSize="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary=".."
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: 700,
                          color: "text.secondary",
                        }}
                      />
                    </ListItemButton>
                  )}

                  {files.length === 0 ? (
                    <Box py={4} textAlign="center">
                      <Typography variant="body2" color="text.secondary">
                        This folder is empty.
                      </Typography>
                    </Box>
                  ) : (
                    files.map((file) => (
                      <ListItemButton
                        key={file.name}
                        selected={
                          selectedFile?.name === file.name &&
                          file.type === "file"
                        }
                        onClick={() => handleNodeClick(file)}
                        sx={{
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {file.type === "folder" ? (
                            <FolderIcon color="primary" fontSize="small" />
                          ) : (
                            <InsertDriveFileIcon
                              color="action"
                              fontSize="small"
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={file.updatedAt}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: file.type === "folder" ? 700 : 500,
                          }}
                          secondaryTypographyProps={{ variant: "caption" }}
                        />
                        {file.size && (
                          <Typography variant="caption" color="text.secondary">
                            {file.size}
                          </Typography>
                        )}
                      </ListItemButton>
                    ))
                  )}
                </List>
              )}
            </CardContent>
          </Card>

          {/* File Viewer / Content Panel */}
          <Card variant="outlined" sx={{ borderRadius: 3, flex: 2 }}>
            <CardContent sx={{ p: 3 }}>
              {selectedFile ? (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <ArticleIcon color="action" />
                    <Typography variant="h6" fontWeight="bold">
                      {selectedFile.name}
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      bgcolor: "action.hover",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.875rem",
                      borderRadius: 2,
                    }}
                  >
                    {selectedFile.content || "// Binary or empty file"}
                  </Paper>
                </Box>
              ) : (
                <Box py={6} textAlign="center">
                  <Typography color="text.secondary">
                    Select a file from the list to preview its contents.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* TAB 2: ISSUES LINKED TO REPOSITORY */}
      {activeTab === 1 && (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6" fontWeight="bold">
                Repository Issues
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                onClick={() =>
                  navigate(`/issues/new?repositoryId=${repository._id || id}`)
                }
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  bgcolor: "#5e35b1",
                }}
              >
                New Issue
              </Button>
            </Stack>

            {issues.length === 0 ? (
              <Box py={4} textAlign="center">
                <Typography color="text.secondary">
                  No issues linked to this repository yet.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {issues.map((issue) => (
                  <Paper
                    key={issue.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderRadius: 2,
                      "&:hover": { borderColor: "primary.main" },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={2}
                    >
                      <Box>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          mb={0.5}
                        >
                          <Chip
                            label={issue.id}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: "bold" }}
                          />
                          <Typography variant="subtitle1" fontWeight={700}>
                            {issue.title}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Opened by <strong>{issue.author}</strong> on{" "}
                          {issue.createdAt}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          label={(issue.status || "UNKNOWN").replace("_", " ").toUpperCase()}
                          color={
                            issue.status === "open"
                              ? "error"
                              : issue.status === "in_progress"
                                ? "warning"
                                : "success"
                          }
                        />
                        <Chip
                          size="small"
                          label={`${(issue.priority || "NORMAL").toUpperCase()} PRIORITY`}
                          variant="outlined"
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Version Modal Dialog */}
      {id && (
        <UploadVersionModal
          open={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
          repositoryId={id}
        />
      )}
    </Box>
  );
};

export default RepositoryDetailPage;