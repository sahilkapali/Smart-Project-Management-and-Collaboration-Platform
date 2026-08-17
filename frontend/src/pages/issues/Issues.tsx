import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BugReportIcon from "@mui/icons-material/BugReport";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { getIssues, deleteIssue } from "../../services/issues.service";
import type {
  Issue,
  IssueStatus,
  IssuePriority,
} from "../../types/issues.types";

const IssuesPage: React.FC = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIssues();
      setIssues(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load issues.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleDelete = async (id: string | undefined) => {
    if (!id || !window.confirm("Are you sure you want to delete this issue?"))
      return;
    try {
      await deleteIssue(id);
      fetchIssues();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete issue.");
    }
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case "open":
        return "error";
      case "in_progress":
        return "warning";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" fontWeight="bold">
          Issues
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/issues/create")} // You can map this to a modal or new page later
          sx={{ bgcolor: "#5e35b1", "&:hover": { bgcolor: "#4527a0" } }}
        >
          New Issue
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : issues.length === 0 && !error ? (
        <Box textAlign="center" py={10} bgcolor="action.hover" borderRadius={3}>
          <BugReportIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            No issues found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Great job! You don't have any open issues right now.
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/issues/create")}>
            Report an Issue
          </Button>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 3 }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="issues table">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Assignee</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issues.map((issue) => {
                const issueId = issue.id || issue._id;
                return (
                  <TableRow
                    key={issueId}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="subtitle2" fontWeight="bold">
                        {issue.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ display: "block", maxWidth: 300 }}
                      >
                        {issue.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={issue.status.replace("_", " ").toUpperCase()}
                        size="small"
                        color={getStatusColor(issue.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={issue.priority.toUpperCase()}
                        size="small"
                        color={getPriorityColor(issue.priority)}
                      />
                    </TableCell>
                    <TableCell>
                      {issue.assignee ? (
                        issue.assignee
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => navigate(`/issues/${issueId}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/issues/${issueId}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(issueId)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default IssuesPage;
