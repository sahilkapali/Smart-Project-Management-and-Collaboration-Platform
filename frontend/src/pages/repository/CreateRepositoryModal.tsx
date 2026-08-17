import React, { useState } from 'react';
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
import { createRepository } from '../../services/repository.service';
import type { CreateRepositoryModalProps } from '../../types/repository.types';

const CreateRepositoryModal: React.FC<CreateRepositoryModalProps> = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [project, setProject] = useState(''); // Added Project ID state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !project.trim()) return;

    try {
      setLoading(true);
      setError(null);
      // Included project in the payload
      await createRepository({ name, description, visibility, project });
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create repository.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setVisibility('private');
    setProject('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">Create New Repository</DialogTitle>
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
            helperText="Enter the ID of the project this repository belongs to"
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
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !name.trim() || !project.trim()} sx={{ bgcolor: '#5e35b1' }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateRepositoryModal;