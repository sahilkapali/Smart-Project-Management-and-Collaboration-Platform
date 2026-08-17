import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getIssueById, updateIssue } from '../../services/issues.service';
import type { IssuePriority, IssueStatus } from '../../types/issues.types';

const EditIssuePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [status, setStatus] = useState<IssueStatus>('open');
  const [assignee, setAssignee] = useState('');
  const [projectId, setProjectId] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssue = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const issue = await getIssueById(id);
      setTitle(issue.title || '');
      setDescription(issue.description || '');
      setPriority(issue.priority || 'medium');
      setStatus(issue.status || 'open');
      setAssignee(issue.assignee || '');
      setProjectId(issue.projectId || '');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load issue data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIssue();
  }, [fetchIssue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await updateIssue(id, {
        title,
        description,
        priority,
        status,
        assignee,
        projectId
      });
      navigate(`/issues/${id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update issue.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" mb={4} spacing={2}>
        <IconButton onClick={() => navigate(`/issues/${id}`)} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Edit Issue
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <TextField
            label="Issue Title *"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            disabled={submitting}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            disabled={submitting}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <TextField
              select
              label="Status"
              fullWidth
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
              disabled={submitting}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>

            <TextField
              select
              label="Priority"
              fullWidth
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
              disabled={submitting}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2, mb: 3 }}>
            <TextField
              label="Assignee"
              fullWidth
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              disabled={submitting}
              placeholder="Username or Member ID"
            />

            <TextField
              label="Project ID"
              fullWidth
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={submitting}
            />
          </Stack>

          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button 
              variant="outlined" 
              onClick={() => navigate(`/issues/${id}`)} 
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitting || !title.trim()} 
              sx={{ bgcolor: '#5e35b1', '&:hover': { bgcolor: '#4527a0' }, minWidth: 130 }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditIssuePage;