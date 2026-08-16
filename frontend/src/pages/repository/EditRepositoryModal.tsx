import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { updateRepository } from '../../services/repository.service';
import type { EditRepositoryModalProps } from '../../types/repository.types';

const EditRepositoryModal: React.FC<EditRepositoryModalProps> = ({ open, onClose, onSuccess, repository }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [project, setProject] = useState(''); // Added Project ID state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (repository) {
      setName(repository.name || '');
      setDescription(repository.description || '');
      setVisibility(repository.visibility || 'private');
      setProject(repository.project || ''); // Pre-fill project ID
    }
  }, [repository]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !project.trim() || !repository) return;
    
    const repoId = repository.id || repository._id;
    if (!repoId) return;

    try {
      setLoading(true);
      setError(null);
      // Included project in the payload
      await updateRepository(repoId, { name, description, visibility, project });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update repository.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">Edit Repository</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Project ID"
            fullWidth
            required
            value={project}
            onChange={(e) => setProject(e.target.value)}
            margin="normal"
            disabled={loading}
          />
          <TextField
            label="Repository Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            disabled={loading}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            disabled={loading}
          />
          <TextField
            select
            label="Visibility"
            fullWidth
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            margin="normal"
            disabled={loading}
          >
            <MenuItem value="private">Private</MenuItem>
            <MenuItem value="public">Public</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !name.trim() || !project.trim()} sx={{ bgcolor: '#5e35b1' }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditRepositoryModal;