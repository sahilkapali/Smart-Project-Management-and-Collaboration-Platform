import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, CircularProgress, Alert
} from '@mui/material';
import { updateRepository } from '../../services/repository.service';

interface EditRepositoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  repository: any; // The repository object being edited
}

const EditRepositoryModal: React.FC<EditRepositoryModalProps> = ({ open, onClose, onSuccess, repository }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    githubUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill the form when the modal opens or the repository changes
  useEffect(() => {
    if (repository && open) {
      setFormData({
        name: repository.name || '',
        description: repository.description || '',
        githubUrl: repository.githubUrl || ''
      });
    }
  }, [repository, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name) {
      setError('Repository Name is required.');
      return;
    }

    try {
      setLoading(true);
      await updateRepository(repository._id, formData);
      onSuccess(); 
      onClose(); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight="bold">Edit Repository</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              label="Repository Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
            
            <TextField
              label="GitHub URL (Optional)"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose} color="inherit" disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#5e35b1', '&:hover': { bgcolor: '#4527a0' } }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditRepositoryModal;