import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { createRepository } from '../../services/repository.service';

interface CreateRepositoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultProjectId?: string;
}

const CreateRepositoryModal: React.FC<CreateRepositoryModalProps> = ({ 
  open, 
  onClose, 
  onSuccess,
  defaultProjectId = '' 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    project: defaultProjectId,
    description: '',
    githubUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.project) {
      setError('Name and Project ID are required.');
      return;
    }

    try {
      setLoading(true);
      await createRepository(formData);
      onSuccess(); 
      handleClose(); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', project: defaultProjectId, description: '', githubUrl: '' });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight="bold">Create New Repository</DialogTitle>
      
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
              label="Project ID"
              name="project"
              value={formData.project}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              helperText="Enter associated project ID."
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
              placeholder="https://github.com/username/repo"
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ bgcolor: '#5e35b1', '&:hover': { bgcolor: '#4527a0' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateRepositoryModal;