// ActivityFeedPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import BugReportIcon from "@mui/icons-material/BugReport";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CommentIcon from "@mui/icons-material/Comment";
import FolderIcon from "@mui/icons-material/Folder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HistoryIcon from "@mui/icons-material/History";

import { getActivities } from "../../services/activity.service";

import type {
  ActivityAction,
  ActivityEntityType,
  ActivityItem,
  ActivityUser,
} from "../../types/activity.types";

// =====================================================
// COMPONENT
// =====================================================

const ActivityFeedPage: React.FC = () => {
  const navigate = useNavigate();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState<ActivityEntityType | "ALL">(
    "ALL",
  );

  // ===================================================
  // HELPER: GET USER FULL NAME
  // ===================================================

  const getUserFullName = (user?: ActivityUser): string => {
    if (!user) return "Unknown User";
    if (user.name) return user.name;
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return "Unknown User";
  };

  // ===================================================
  // FETCH ACTIVITIES
  // ===================================================

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActivities(100);
      setActivities(data);
    } catch (err: any) {
      console.error("Failed to fetch activities:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load activity feed.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // ===================================================
  // ACTION TEXT & ICONS
  // ===================================================

  const getActionText = (action: ActivityAction): string => {
    switch (action) {
      case "PROJECT_CREATED":
        return "created project";
      case "PROJECT_UPDATED":
        return "updated project";
      case "PROJECT_DELETED":
        return "deleted project";
      case "TASK_CREATED":
        return "created task";
      case "TASK_UPDATED":
        return "updated task";
      case "TASK_ASSIGNED":
        return "assigned a task";
      case "TASK_COMPLETED":
        return "completed task";
      case "TASK_DELETED":
        return "deleted task";
      case "COMMENT_ADDED":
        return "added a comment";
      case "ISSUE_CREATED":
        return "created issue";
      case "ISSUE_UPDATED":
        return "updated issue";
      case "ISSUE_CLOSED":
        return "closed issue";
      case "ISSUE_DELETED":
        return "deleted issue";
      case "REPOSITORY_CREATED":
        return "created repository";
      case "REPOSITORY_UPDATED":
        return "updated repository";
      case "REPOSITORY_DELETED":
        return "deleted repository";
      case "TEAM_CREATED":
        return "created team";
      case "MEMBER_ADDED":
        return "added a member";
      case "MEMBER_REMOVED":
        return "removed a member";
      case "MEETING_CREATED":
        return "created meeting";
      case "MEETING_UPDATED":
        return "updated meeting";
      case "MEETING_CANCELLED":
        return "cancelled meeting";
      case "SYSTEM_ACTIVITY":
        return "performed a system activity";
      default:
        return "performed an activity";
    }
  };

  const getActionIcon = (action: ActivityAction) => {
    switch (action) {
      case "PROJECT_CREATED":
      case "TASK_CREATED":
      case "ISSUE_CREATED":
      case "REPOSITORY_CREATED":
      case "TEAM_CREATED":
      case "MEETING_CREATED":
        return <AddCircleOutlineIcon fontSize="small" />;
      case "PROJECT_UPDATED":
      case "TASK_UPDATED":
      case "ISSUE_UPDATED":
      case "REPOSITORY_UPDATED":
      case "MEETING_UPDATED":
        return <EditIcon fontSize="small" />;
      case "PROJECT_DELETED":
      case "TASK_DELETED":
      case "ISSUE_DELETED":
      case "REPOSITORY_DELETED":
        return <DeleteIcon fontSize="small" />;
      case "TASK_ASSIGNED":
        return <AssignmentIcon fontSize="small" />;
      case "TASK_COMPLETED":
        return <CheckCircleIcon fontSize="small" />;
      case "COMMENT_ADDED":
        return <CommentIcon fontSize="small" />;
      case "ISSUE_CLOSED":
        return <BugReportIcon fontSize="small" />;
      case "MEMBER_ADDED":
        return <PersonAddIcon fontSize="small" />;
      case "MEMBER_REMOVED":
        return <PersonRemoveIcon fontSize="small" />;
      case "MEETING_CANCELLED":
        return <EventIcon fontSize="small" />;
      default:
        return <HistoryIcon fontSize="small" />;
    }
  };

  const getEntityLabel = (entityType?: ActivityEntityType): string => {
    return entityType || "EVENT";
  };

  const getEntityIcon = (entityType?: ActivityEntityType) => {
    switch (entityType) {
      case "PROJECT":
        return <FolderIcon fontSize="small" />;
      case "TASK":
        return <AssignmentIcon fontSize="small" />;
      case "ISSUE":
        return <BugReportIcon fontSize="small" />;
      case "REPOSITORY":
        return <CloudUploadIcon fontSize="small" />;
      case "COMMENT":
        return <CommentIcon fontSize="small" />;
      case "TEAM":
        return <GroupIcon fontSize="small" />;
      case "MEETING":
        return <EventIcon fontSize="small" />;
      default:
        return <HistoryIcon fontSize="small" />;
    }
  };

  // ===================================================
  // FILTER ACTIVITIES
  // ===================================================

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activities.filter((activity) => {
      const userName = getUserFullName(activity.user).toLowerCase();
      const description = activity.description?.toLowerCase() || "";
      const projectName = activity.project?.name?.toLowerCase() || "";
      const action = activity.action.toLowerCase();

      const matchesSearch =
        !query ||
        userName.includes(query) ||
        description.includes(query) ||
        projectName.includes(query) ||
        action.includes(query);

      const matchesEntity =
        entityFilter === "ALL" || activity.entityType === entityFilter;

      return matchesSearch && matchesEntity;
    });
  }, [activities, searchQuery, entityFilter]);

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      {/* HEADER */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <IconButton
          onClick={() => navigate(-1)}
          color="primary"
          aria-label="Go back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Activity Feed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track project events and team activities
          </Typography>
        </Box>
      </Stack>

      {/* FILTERS */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 180 } }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={entityFilter}
              label="Event Type"
              onChange={(event) =>
                setEntityFilter(
                  event.target.value as ActivityEntityType | "ALL",
                )
              }
            >
              <MenuItem value="ALL">All Events</MenuItem>
              <MenuItem value="PROJECT">Projects</MenuItem>
              <MenuItem value="TASK">Tasks</MenuItem>
              <MenuItem value="ISSUE">Issues</MenuItem>
              <MenuItem value="REPOSITORY">Repositories</MenuItem>
              <MenuItem value="COMMENT">Comments</MenuItem>
              <MenuItem value="TEAM">Teams</MenuItem>
              <MenuItem value="MEETING">Meetings</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* LOADING */}
      {loading && (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      )}

      {/* ERROR */}
      {!loading && error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Typography
              component="button"
              onClick={fetchActivities}
              sx={{
                border: 0,
                background: "transparent",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Retry
            </Typography>
          }
        >
          {error}
        </Alert>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredActivities.length === 0 && (
        <Paper
          variant="outlined"
          sx={{ p: 6, textAlign: "center", borderRadius: 3 }}
        >
          <HistoryIcon sx={{ fontSize: 50, color: "text.secondary", mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No activity records found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try changing your search or event filter.
          </Typography>
        </Paper>
      )}

      {/* ACTIVITY LIST */}
      {!loading && !error && filteredActivities.length > 0 && (
        <Stack spacing={2}>
          {filteredActivities.map((item) => {
            const userName = getUserFullName(item.user);
            return (
              <Paper
                key={item._id}
                variant="outlined"
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  transition: "all 0.2s ease",
                  "&:hover": { boxShadow: 2, transform: "translateY(-1px)" },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  {/* USER AVATAR */}
                  <Avatar
                    src={item.user?.avatar || undefined}
                    alt={userName}
                    sx={{ width: 42, height: 42 }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </Avatar>

                  {/* CONTENT */}
                  <Box flex={1} minWidth={0}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      spacing={1}
                    >
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        <Typography component="span" fontWeight={700}>
                          {userName}
                        </Typography>{" "}
                        <Typography component="span" color="text.secondary">
                          {getActionText(item.action)}
                        </Typography>
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "Unknown time"}
                      </Typography>
                    </Stack>

                    {/* PROJECT CONTEXT */}
                    {item.project?.name && (
                      <Typography
                        variant="body2"
                        color="primary"
                        fontWeight={600}
                        sx={{ mt: 0.5 }}
                      >
                        Project: {item.project.name}
                      </Typography>
                    )}

                    {/* DESCRIPTION */}
                    {item.description && (
                      <Box
                        sx={{
                          mt: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "action.hover",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    )}

                    {/* META */}
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                      sx={{ mt: 1.5 }}
                    >
                      <Chip
                        icon={getActionIcon(item.action)}
                        label={getActionText(item.action)}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={getEntityIcon(item.entityType)}
                        label={getEntityLabel(item.entityType)}
                        size="small"
                        variant="outlined"
                      />
                      {item.entityId && (
                        <Chip
                          label={`ID: ${item.entityId}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            maxWidth: 220,
                            "& .MuiChip-label": {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            },
                          }}
                        />
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default ActivityFeedPage;
