import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import BugReportIcon from '@mui/icons-material/BugReport';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CommentIcon from '@mui/icons-material/Comment';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';

import { getActivities } from '../../services/activity.service';
import type { ActivityItem, ActivityAction } from '../../types/activity.types';

const ActivityFeedPage: React.FC = () => {
  const navigate = useNavigate();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActivities();
      setActivities(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load activity log.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActionIcon = (action: ActivityAction) => {
    switch (action) {
      case 'issue_created':
        return <BugReportIcon fontSize="small" sx={{ color: '#ef4444' }} />;
      case 'issue_updated':
        return <EditIcon fontSize="small" sx={{ color: '#f59e0b' }} />;
      case 'issue_resolved':
        return <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />;
      case 'version_uploaded':
        return <CloudUploadIcon fontSize="small" sx={{ color: '#8b5cf6' }} />;
      case 'repo_created':
        return <FolderIcon fontSize="small" sx={{ color: '#3b82f6' }} />;
      case 'comment_added':
        return <CommentIcon fontSize="small" sx={{ color: '#06b6d4' }} />;
      default:
        return <HistoryIcon fontSize="small" sx={{ color: '#9ca3af' }} />;
    }
  };

  const getActionText = (action: ActivityAction) => {
    switch (action) {
      case 'issue_created': return 'created an issue';
      case 'issue_updated': return 'updated issue';
      case 'issue_resolved': return 'resolved issue';
      case 'version_uploaded': return 'released version';
      case 'repo_created': return 'created repository';
      case 'comment_added': return 'commented on';
      case 'project_updated': return 'updated project';
      default: return 'performed an action on';
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      (act.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.entityName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.details || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEntity = entityFilter === 'all' || act.entityType === entityFilter;

    return matchesSearch && matchesEntity;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      {/* HEADER */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <IconButton onClick={() => navigate(-1)} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Activity Feed & Audit Log
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time audit trail of all project events and developer actions
          </Typography>
        </Box>
      </Stack>

      {/* FILTER BAR */}
      <Paper variant="outlined" sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by user, entity name, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={entityFilter}
              label="Event Type"
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              <MenuItem value="all">All Events</MenuItem>
              <MenuItem value="issue">Issues</MenuItem>
              <MenuItem value="repository">Repositories</MenuItem>
              <MenuItem value="comment">Comments</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* FEED CONTENT */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : filteredActivities.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No activity records found
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filteredActivities.map((item, index) => (
            <Paper
              key={item.id || item._id || index}
              variant="outlined"
              onClick={() => item.targetUrl && navigate(item.targetUrl)}
              sx={{
                p: 2.5,
                borderRadius: 3,
                cursor: item.targetUrl ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
                '&:hover': item.targetUrl ? { bgcolor: 'action.hover' } : {}
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar sx={{ bgcolor: '#5e35b1', width: 40, height: 40 }}>
                  {(item.user?.name || 'U')[0].toUpperCase()}
                </Avatar>

                <Box flex={1}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                    <Box>
                      <Typography variant="body1" component="span" fontWeight="bold">
                        {item.user?.name || 'User'}{' '}
                      </Typography>
                      <Typography variant="body1" component="span" color="text.secondary">
                        {getActionText(item.action)}{' '}
                      </Typography>
                      <Typography variant="body1" component="span" fontWeight="bold" color="primary">
                        {item.entityName}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                    </Typography>
                  </Stack>

                  {item.details && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, bgcolor: 'action.hover', p: 1.5, borderRadius: 1.5 }}>
                      {item.details}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} alignItems="center" mt={1.5}>
                    <Box display="flex" alignItems="center" mr={0.5}>
                      {getActionIcon(item.action)}
                    </Box>
                    <Chip label={(item.entityType || 'event').toUpperCase()} size="small" variant="outlined" />
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ActivityFeedPage;