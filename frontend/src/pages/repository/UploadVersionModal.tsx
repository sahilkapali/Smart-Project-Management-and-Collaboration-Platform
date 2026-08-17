import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadRepositoryVersion } from '../../services/repository.service';
import type { UploadVersionModalProps } from '../../types/repository.types';

const UploadVersionModal: React.FC<UploadVersionModalProps> = ({ open, onClose, onSuccess, repositoryId }) => {
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !version.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('version', version);
      formData.append('changelog', changelog);

      await uploadRepositoryVersion(repositoryId, formData);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to upload version.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVersion('');
    setChangelog('');
    setFile(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight="bold">Upload New Version</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box 
            sx={{ 
              border: '2px dashed', 
              borderColor: 'divider', 
              borderRadius: 2, 
              p: 4, 
              textAlign: 'center',
              mb: 3,
              bgcolor: 'action.hover'
            }}
          >
            <input
              accept=".zip,.tar.gz,.rar"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label htmlFor="raised-button-file">
              <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} disabled={loading}>
                Select Archive File
              </Button>
            </label>
            {file && (
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Selected: <strong>{file.name}</strong>
              </Typography>
            )}
          </Box>

          <TextField
            label="Version Number (e.g., 1.0.1)"
            fullWidth
            required
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            margin="normal"
            disabled={loading}
          />
          <TextField
            label="Changelog / Notes"
            fullWidth
            multiline
            rows={3}
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            margin="normal"
            disabled={loading}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !file || !version.trim()} sx={{ bgcolor: '#5e35b1' }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UploadVersionModal;