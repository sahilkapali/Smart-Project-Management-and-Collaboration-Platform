import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { createIssue } from '../../services/issues.service';
import type { IssuePriority } from '../../types/issues.types';

const CreateIssuePage: React.FC = () => {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [projectId, setProjectId] = useState('');
  const [assignee, setAssignee] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId.trim()) {
      setError('Title and Project ID are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createIssue({
        title,
        description,
        priority,
        projectId,
        assignee: assignee || undefined, // Only send if provided
      });
      navigate('/issues'); // Redirect back to list on success
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" mb={4} spacing={2}>
        <IconButton onClick={() => navigate('/issues')} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Create New Issue
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <TextField
            label="Project ID *"
            fullWidth
            required
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            margin="normal"
            disabled={loading}
            helperText="Enter the ID of the project this issue belongs to"
          />

          <TextField
            label="Issue Title *"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            disabled={loading}
            placeholder="e.g., Login button not responding on mobile"
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            disabled={loading}
            placeholder="Provide detailed steps to reproduce, expected behavior, and actual behavior."
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2, mb: 3 }}>
            <TextField
              select
              label="Priority"
              fullWidth
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
              disabled={loading}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>

            <TextField
              label="Assignee (Username/ID)"
              fullWidth
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              disabled={loading}
              placeholder="Leave blank if unassigned"
            />
          </Stack>

          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/issues')} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading || !title.trim() || !projectId.trim()} 
              sx={{ bgcolor: '#5e35b1', '&:hover': { bgcolor: '#4527a0' }, minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Issue'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateIssuePage;