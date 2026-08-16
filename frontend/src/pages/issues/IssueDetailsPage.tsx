import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Grid,
  Divider,
  MenuItem,
  Select,
  FormControl,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  type SelectChangeEvent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';

import {
  getIssueById,
  updateIssue,
  deleteIssue,
  getIssueComments,
  addIssueComment
} from '../../services/issues.service';
import type { Issue, IssueStatus, IssuePriority, IssueComment } from '../../types/issues.types';

const IssueDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status & Assignee update states
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isEditingAssignee, setIsEditingAssignee] = useState<boolean>(false);
  const [assigneeInput, setAssigneeInput] = useState<string>('');

  // Comments states
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [postingComment, setPostingComment] = useState<boolean>(false);

  const fetchIssueAndComments = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getIssueById(id);
      setIssue(data);
      setAssigneeInput(data.assignee || '');

      // Load comments
      setLoadingComments(true);
      const commentsData = await getIssueComments(id);
      setComments(commentsData);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load issue details.');
    } finally {
      setLoading(false);
      setLoadingComments(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIssueAndComments();
  }, [fetchIssueAndComments]);

  const handleStatusChange = async (event: SelectChangeEvent) => {
    if (!id || !issue) return;
    const newStatus = event.target.value as IssueStatus;
    
    try {
      setIsUpdating(true);
      const updated = await updateIssue(id, { status: newStatus });
      setIssue(updated);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssigneeSave = async () => {
    if (!id || !issue) return;
    
    try {
      setIsUpdating(true);
      const updated = await updateIssue(id, { assignee: assigneeInput });
      setIssue(updated);
      setIsEditingAssignee(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update assignee.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) return;
    
    try {
      setIsUpdating(true);
      await deleteIssue(id);
      navigate('/issues');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete issue.');
      setIsUpdating(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim()) return;

    try {
      setPostingComment(true);
      const newComment = await addIssueComment(id, commentText.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to post comment.');
    } finally {
      setPostingComment(false);
    }
  };

  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !issue) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error || 'Issue not found'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/issues')}>
          Back to Issues
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* HEADER */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => navigate('/issues')} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            {issue.title}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            disabled={isUpdating}
            onClick={() => navigate(`/issues/${id}/edit`)}
          >
            Edit Issue
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={isUpdating}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={4}>
        {/* LEFT COLUMN: Content & Discussion */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Description
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
              {issue.description || 'No description provided.'}
            </Typography>
          </Paper>

          {/* COMMENTS SECTION */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <ChatIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Discussion ({comments.length})
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            {/* Comment List */}
            {loadingComments ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={30} />
              </Box>
            ) : comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No comments yet. Start the conversation below!
              </Typography>
            ) : (
              <List sx={{ mb: 3 }}>
                {comments.map((comment, index) => (
                  <React.Fragment key={comment.id || comment._id || index}>
                    <ListItem alignItems="flex-start" disableGutters>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#5e35b1', width: 36, height: 36 }}>
                          {(comment.author || 'U')[0].toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {comment.author || 'User'}
                            </Typography>
                            {comment.createdAt && (
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Stack>
                        }
                        secondary={
                          <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                            {comment.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}

            {/* Add Comment Input */}
            <form onSubmit={handlePostComment}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={postingComment}
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={postingComment || !commentText.trim()}
                  endIcon={postingComment ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                  sx={{ bgcolor: '#5e35b1', '&:hover': { bgcolor: '#4527a0' }, height: 40, px: 3 }}
                >
                  Post
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Meta Details */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              {/* Status */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <FormControl fullWidth size="small" disabled={isUpdating}>
                  <Select
                    value={issue.status}
                    onChange={handleStatusChange}
                    sx={{
                      bgcolor: issue.status === 'open' ? 'error.light' : 
                               issue.status === 'in_progress' ? 'warning.light' : 
                               issue.status === 'resolved' ? 'success.light' : 'action.hover',
                      fontWeight: 'bold'
                    }}
                  >
                    <MenuItem value="open">OPEN</MenuItem>
                    <MenuItem value="in_progress">IN PROGRESS</MenuItem>
                    <MenuItem value="resolved">RESOLVED</MenuItem>
                    <MenuItem value="closed">CLOSED</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Assignee */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Assignee
                </Typography>
                {isEditingAssignee ? (
                  <Stack direction="row" spacing={1}>
                    <TextField 
                      size="small" 
                      fullWidth 
                      value={assigneeInput} 
                      onChange={(e) => setAssigneeInput(e.target.value)}
                      placeholder="Username/ID"
                      autoFocus
                    />
                    <IconButton size="small" color="primary" onClick={handleAssigneeSave} disabled={isUpdating}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => { setIsEditingAssignee(false); setAssigneeInput(issue.assignee || ''); }} disabled={isUpdating}>
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body1" fontWeight="medium">
                      {issue.assignee || 'Unassigned'}
                    </Typography>
                    <IconButton size="small" onClick={() => setIsEditingAssignee(true)} disabled={isUpdating}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Box>

              {/* Priority */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Priority
                </Typography>
                <Chip 
                  label={issue.priority.toUpperCase()} 
                  color={getPriorityColor(issue.priority)} 
                  size="small" 
                />
              </Box>

              {/* Project Link */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Project ID
                </Typography>
                <Typography variant="body2">
                  {issue.projectId || 'N/A'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IssueDetailsPage;