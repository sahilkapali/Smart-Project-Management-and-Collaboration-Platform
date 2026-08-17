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
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CodeIcon from "@mui/icons-material/Code";
import BugReportIcon from "@mui/icons-material/BugReport";
import LockIcon from "@mui/icons-material/Lock";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import ArticleIcon from "@mui/icons-material/Article";
import SubdirectoryArrowLeftIcon from "@mui/icons-material/SubdirectoryArrowLeft";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GitHubIcon from "@mui/icons-material/GitHub";

// Services
import {
  getRepositoryById,
  getRepositoryFiles,
  getRepositoryIssues,
} from "../../services/repository.service";

// Types
import type {
  FileNode,
  Repository,
  RepositoryIssue,
} from "../../types/repository.types";

// Modal
import UploadVersionModal from "./UploadVersionModal";

const RepositoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [activeTab, setActiveTab] = useState(0);

  const [repository, setRepository] = useState<Repository | null>(null);

  const [files, setFiles] = useState<FileNode[]>([]);

  const [issues, setIssues] = useState<RepositoryIssue[]>([]);

  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  const [currentPath, setCurrentPath] = useState("");

  const [filesLoading, setFilesLoading] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  // =====================================================
  // REPOSITORY ID
  // =====================================================

  const repositoryId = repository?._id || id || "";

  // =====================================================
  // GITHUB / CLONE URL
  // =====================================================

  /*
   * Your backend repository model currently provides:
   *
   * githubUrl
   *
   * It does NOT provide:
   * cloneUrl
   * gitUrl
   *
   * Therefore we use githubUrl directly.
   */

  const githubUrl = repository?.githubUrl || "";

  const handleCopyGithubUrl = async () => {
    if (!githubUrl) return;

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

  // =====================================================
  // FETCH REPOSITORY DETAILS
  // =====================================================

  const fetchRepositoryDetails = useCallback(async () => {
    if (!id) {
      setError("Repository ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [repoData, filesData, issuesData] = await Promise.all([
        getRepositoryById(id),

        getRepositoryFiles(id, "").catch(() => []),

        getRepositoryIssues(id).catch(() => []),
      ]);

      setRepository(repoData);

      const safeFiles = Array.isArray(filesData) ? filesData : [];

      const safeIssues = Array.isArray(issuesData) ? issuesData : [];

      setFiles(safeFiles);
      setIssues(safeIssues);

      // Prefer README
      const readme = safeFiles.find(
        (file) =>
          file.type === "file" && file.name.toLowerCase() === "readme.md",
      );

      setSelectedFile(readme || safeFiles[0] || null);

      setCurrentPath("");
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

  // =====================================================
  // FETCH DIRECTORY
  // =====================================================

  const fetchDirectory = async (path: string) => {
    if (!id) return;

    try {
      setFilesLoading(true);

      const result = await getRepositoryFiles(id, path);

      const safeFiles = Array.isArray(result) ? result : [];

      setFiles(safeFiles);
      setCurrentPath(path);

      /*
       * When entering a folder, clear the
       * previous selected file.
       */
      setSelectedFile(null);
    } catch (err) {
      console.error("Failed to load directory:", err);
    } finally {
      setFilesLoading(false);
    }
  };

  // =====================================================
  // FILE / FOLDER CLICK
  // =====================================================

  const handleNodeClick = (node: FileNode) => {
    if (node.type === "folder") {
      const nextPath = currentPath ? `${currentPath}/${node.name}` : node.name;

      fetchDirectory(nextPath);
      return;
    }

    setSelectedFile(node);
  };

  // =====================================================
  // BREADCRUMB
  // =====================================================

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      fetchDirectory("");
      return;
    }

    const segments = currentPath.split("/").filter(Boolean);

    const targetPath = segments.slice(0, index + 1).join("/");

    fetchDirectory(targetPath);
  };

  // =====================================================
  // NAVIGATE UP
  // =====================================================

  const handleNavigateUp = () => {
    const segments = currentPath.split("/").filter(Boolean);

    segments.pop();

    fetchDirectory(segments.join("/"));
  };

  // =====================================================
  // UPLOAD SUCCESS
  // =====================================================

  const handleUploadSuccess = async () => {
    await fetchRepositoryDetails();

    if (currentPath !== "") {
      await fetchDirectory(currentPath);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value?: string | Date | null) => {
    if (!value) {
      return "";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =====================================================
  // FORMAT ISSUE AUTHOR
  // =====================================================

  const getIssueAuthor = (issue: RepositoryIssue): string => {
    /*
     * Different backend responses may
     * populate createdBy as an object.
     *
     * We intentionally avoid assuming
     * author has a specific type.
     */

    const issueData = issue as RepositoryIssue & {
      author?: unknown;
      createdBy?: unknown;
    };

    const author = issueData.author ?? issueData.createdBy;

    if (!author) {
      return "Unknown";
    }

    if (typeof author === "string") {
      return author;
    }

    if (typeof author === "object") {
      const authorObject = author as {
        name?: string;
        email?: string;
        _id?: string;
      };

      return (
        authorObject.name || authorObject.email || authorObject._id || "Unknown"
      );
    }

    return String(author);
  };

  // =====================================================
  // ISSUE IDENTIFIER
  // =====================================================

  const getIssueIdentifier = (issue: RepositoryIssue): string => {
    /*
     * Your current RepositoryIssue type
     * does not contain issueNumber.
     *
     * Therefore use _id.
     */

    return issue._id || "Issue";
  };

  // =====================================================
  // LOADING
  // =====================================================

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

  // =====================================================
  // ERROR
  // =====================================================

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

  // =====================================================
  // PATH
  // =====================================================

  const pathSegments = currentPath.split("/").filter(Boolean);

  // =====================================================
  // RENDER
  // =====================================================

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
      {/* =================================================
          BACK BUTTON
      ================================================= */}

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

      {/* =================================================
          REPOSITORY HEADER
      ================================================= */}

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
            spacing={2}
          >
            {/* Repository information */}

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

                {/* Current backend does not have visibility.
                    We therefore show a generic private chip. */}

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

              {/* Project information */}

              {repository.project && (
                <Chip
                  size="small"
                  label="Project Repository"
                  variant="outlined"
                  sx={{ mt: 1.5 }}
                />
              )}
            </Box>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
              alignItems="center"
            >
              {/* GitHub URL */}

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
                  <GitHubIcon fontSize="small" sx={{ mr: 1 }} />

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

              {/* Open GitHub */}

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
                    whiteSpace: "nowrap",
                  }}
                >
                  GitHub
                </Button>
              )}

              {/* Upload version */}

              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setIsUploadModalOpen(true)}
                sx={{
                  bgcolor: "#5e35b1",
                  textTransform: "none",
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: "#4527a0",
                  },
                }}
              >
                Upload Version
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* =================================================
          TABS
      ================================================= */}

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

      {/* =================================================
          CODE & FILES
      ================================================= */}

      {activeTab === 0 && (
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={3}
        >
          {/* =================================================
              FILE EXPLORER
          ================================================= */}

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              flex: 1,
              minWidth: 0,
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Breadcrumb */}

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
                    sx={{
                      fontSize: "0.875rem",
                    }}
                  >
                    root
                  </Link>

                  {pathSegments.map((segment, index) => {
                    const isLast = index === pathSegments.length - 1;

                    return isLast ? (
                      <Typography
                        key={`${segment}-${index}`}
                        color="text.primary"
                        fontWeight={700}
                        fontSize="0.875rem"
                      >
                        {segment}
                      </Typography>
                    ) : (
                      <Link
                        key={`${segment}-${index}`}
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

              {/* Loading */}

              {filesLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <List disablePadding>
                  {/* Up one level */}

                  {currentPath !== "" && (
                    <ListItemButton
                      onClick={handleNavigateUp}
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                        }}
                      >
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

                  {/* Empty folder */}

                  {files.length === 0 ? (
                    <Box py={4} textAlign="center">
                      <Typography variant="body2" color="text.secondary">
                        This folder is empty.
                      </Typography>
                    </Box>
                  ) : (
                    files.map((file) => (
                      <ListItemButton
                        key={`${file.name}-${file.type}`}
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
                        <ListItemIcon
                          sx={{
                            minWidth: 36,
                          }}
                        >
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
                          secondary={
                            file.updatedAt
                              ? formatDate(file.updatedAt)
                              : undefined
                          }
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: file.type === "folder" ? 700 : 500,
                          }}
                          secondaryTypographyProps={{
                            variant: "caption",
                          }}
                        />

                        {file.size !== undefined && file.size !== null && (
                          <Typography variant="caption" color="text.secondary">
                            {String(file.size)}
                          </Typography>
                        )}
                      </ListItemButton>
                    ))
                  )}
                </List>
              )}
            </CardContent>
          </Card>

          {/* =================================================
              FILE VIEWER
          ================================================= */}

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              flex: 2,
              minWidth: 0,
            }}
          >
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
                      overflowX: "auto",
                      maxHeight: "600px",
                      overflowY: "auto",
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

      {/* =================================================
          ISSUES
      ================================================= */}

      {activeTab === 1 && (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Repository Issues
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Issues associated with this repository
                </Typography>
              </Box>

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
                  "&:hover": {
                    bgcolor: "#4527a0",
                  },
                }}
              >
                New Issue
              </Button>
            </Stack>

            {/* No issues */}

            {issues.length === 0 ? (
              <Box py={6} textAlign="center">
                <BugReportIcon
                  sx={{
                    fontSize: 48,
                    color: "text.disabled",
                    mb: 1,
                  }}
                />

                <Typography color="text.secondary">
                  No issues linked to this repository yet.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {issues.map((issue) => {
                  const issueIdentifier = getIssueIdentifier(issue);

                  const author = getIssueAuthor(issue);

                  const createdAt = issue.createdAt
                    ? formatDate(issue.createdAt)
                    : "";

                  const status = String(issue.status || "unknown");

                  const priority = String(issue.priority || "normal");

                  return (
                    <Paper
                      key={issue._id || issueIdentifier || issue.title}
                      variant="outlined"
                      sx={{
                        p: 2,
                        mb: 1.5,
                        borderRadius: 2,
                        "&:hover": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <Stack
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
                        justifyContent="space-between"
                        alignItems={{
                          xs: "flex-start",
                          sm: "center",
                        }}
                        spacing={2}
                      >
                        {/* Issue information */}

                        <Box
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            mb={0.5}
                            flexWrap="wrap"
                          >
                            <Chip
                              label={issueIdentifier}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{
                                fontWeight: "bold",
                              }}
                            />

                            <Typography variant="subtitle1" fontWeight={700}>
                              {issue.title}
                            </Typography>
                          </Stack>

                          <Typography variant="caption" color="text.secondary">
                            Opened by <strong>{author}</strong>
                            {createdAt && ` on ${createdAt}`}
                          </Typography>
                        </Box>

                        {/* Status / Priority */}

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip
                            size="small"
                            label={status.replace(/_/g, " ").toUpperCase()}
                            color={
                              status === "open"
                                ? "error"
                                : status === "in_progress"
                                  ? "warning"
                                  : status === "closed"
                                    ? "success"
                                    : "default"
                            }
                          />

                          <Chip
                            size="small"
                            label={`${priority.toUpperCase()} PRIORITY`}
                            variant="outlined"
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* =================================================
          UPLOAD VERSION MODAL
      ================================================= */}

      {repositoryId && (
        <UploadVersionModal
          open={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
          repositoryId={repositoryId}
        />
      )}
    </Box>
  );
};

export default RepositoryDetailPage;
