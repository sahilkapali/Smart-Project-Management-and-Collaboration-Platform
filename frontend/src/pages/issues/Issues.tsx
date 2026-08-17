import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";

import { getIssues, deleteIssue } from "../../services/issues.service";

import type {
  Issue,
  IssuePriority,
  IssueStatus,
} from "../../types/issue.types";

const Issues = () => {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [issues, setIssues] = useState<Issue[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ============================================================
  // LOAD ISSUES
  // ============================================================

  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getIssues();

      setIssues(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Loading issues failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load issues.",
      );

      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIssues();
  }, [loadIssues]);

  // ============================================================
  // GET ISSUE ID
  // ============================================================

  const getIssueId = (issue: Issue): string => {
    return issue.id || issue._id || "";
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredIssues = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return issues;
    }

    return issues.filter((issue) => {
      const title = issue.title?.toLowerCase() || "";

      const description = issue.description?.toLowerCase() || "";

      return title.includes(value) || description.includes(value);
    });
  }, [issues, search]);

  // ============================================================
  // STATUS COLOR
  // ============================================================

  const getStatusColor = (
    status: IssueStatus,
  ): "error" | "warning" | "success" | "default" => {
    switch (status) {
      case "Open":
        return "error";

      case "In Progress":
        return "warning";

      case "Resolved":
        return "success";

      case "Closed":
        return "default";

      default:
        return "default";
    }
  };

  // ============================================================
  // PRIORITY COLOR
  // ============================================================

  const getPriorityColor = (
    priority: IssuePriority,
  ): "error" | "warning" | "info" | "success" | "default" => {
    switch (priority) {
      case "Critical":
        return "error";

      case "High":
        return "warning";

      case "Medium":
        return "info";

      case "Low":
        return "success";

      default:
        return "default";
    }
  };

  // ============================================================
  // USER NAME
  // ============================================================

  const getUserName = (
    user:
      | string
      | {
          _id: string;
          name: string;
          email: string;
          role?: string;
        }
      | null
      | undefined,
  ) => {
    if (!user) {
      return "Unassigned";
    }

    if (typeof user === "object") {
      return user.name || user.email || "User";
    }

    return user;
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (issue: Issue) => {
    const id = getIssueId(issue);

    if (!id) {
      setError("Issue ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteIssue(id);

      setIssues((previous) =>
        previous.filter((item) => getIssueId(item) !== id),
      );
    } catch (err: any) {
      console.error("Delete issue failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete issue.",
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">Loading issues...</Typography>
        </Stack>
      </Box>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* HEADER */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: "1.8rem",
                sm: "2.2rem",
                md: "2.4rem",
              },
              fontWeight: 700,
            }}
          >
            Issues
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Track and manage repository issues
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => navigate("/issues/create")}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          New Issue
        </Button>
      </Stack>

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void loadIssues()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* SEARCH */}

      <TextField
        fullWidth
        size="small"
        placeholder="Search issues..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{
          maxWidth: 450,
          mb: 3,
        }}
        InputProps={{
          startAdornment: (
            <SearchRoundedIcon
              fontSize="small"
              sx={{
                mr: 1,
                color: "text.secondary",
              }}
            />
          ),
        }}
      />

      {/* EMPTY */}

      {filteredIssues.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <CardContent
            sx={{
              minHeight: 350,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <BugReportRoundedIcon
              sx={{
                fontSize: 64,
                color: "text.secondary",
                mb: 2,
              }}
            />

            <Typography variant="h6" fontWeight={700}>
              No issues found
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {search
                ? "No issues match your search."
                : "Create an issue to get started."}
            </Typography>

            {!search && (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => navigate("/issues/create")}
                sx={{
                  mt: 2,
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Create Issue
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {filteredIssues.map((issue) => {
            const issueId = getIssueId(issue);

            return (
              <Card
                key={issueId || issue.title}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2.5,
                  transition: "all 0.18s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <CardContent>
                  <Stack
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    spacing={2}
                    alignItems={{
                      xs: "flex-start",
                      md: "center",
                    }}
                    justifyContent="space-between"
                  >
                    {/* ISSUE INFO */}

                    <Box
                      sx={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          wordBreak: "break-word",
                        }}
                      >
                        {issue.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {issue.description || "No description available."}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{
                          mt: 1.5,
                        }}
                      >
                        <Chip
                          size="small"
                          label={issue.status}
                          color={getStatusColor(issue.status)}
                        />

                        <Chip
                          size="small"
                          label={issue.priority}
                          color={getPriorityColor(issue.priority)}
                        />

                        <Chip
                          size="small"
                          variant="outlined"
                          label={`Assigned: ${getUserName(issue.assignedTo)}`}
                        />
                      </Stack>
                    </Box>

                    {/* ACTIONS */}

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/issues/${issueId}`)}
                        disabled={!issueId}
                      >
                        <VisibilityRoundedIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => void handleDelete(issue)}
                        disabled={!issueId}
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default Issues;
