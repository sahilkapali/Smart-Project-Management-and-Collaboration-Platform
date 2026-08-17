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
  TextField,
  Divider,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import { getRepositoryVersions, createRepositoryVersion } from '../../services/repository.service';
import type { RepositoryVersion } from '../../types/repository.types';

const RepositoryVersionHistoryPage: React.FC = () => {
  const { id, repositoryId } = useParams<{ id?: string; repositoryId?: string }>();
  const currentRepoId = id || repositoryId || '';
  const navigate = useNavigate();

  const [versions, setVersions] = useState<RepositoryVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [versionNumber, setVersionNumber] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [changelog, setChangelog] = useState<string>('');
  const [commitHash, setCommitHash] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchVersions = useCallback(async () => {
    if (!currentRepoId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getRepositoryVersions(currentRepoId);
      setVersions(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch version history.');
    } finally {
      setLoading(false);
    }
  }, [currentRepoId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRepoId || !versionNumber.trim() || !title.trim()) return;

    try {
      setSubmitting(true);
      await createRepositoryVersion(currentRepoId, {
        versionNumber,
        title,
        changelog,
        commitHash
      });
      setOpenModal(false);
      setVersionNumber('');
      setTitle('');
      setChangelog('');
      setCommitHash('');
      fetchVersions();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add version.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVersions = versions.filter(
    (v) =>
      (v.versionNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.changelog || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      {/* HEADER */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={4} spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => navigate(-1)} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Repository Versions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track code releases, changelogs, and commit history
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#5e35b1', '&:hover': { bgcolor: '#4527a0' } }}
        >
          New Release
        </Button>
      </Stack>

      {/* SEARCH BAR */}
      <Paper variant="outlined" sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by version number, title, or changelog..."
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
      </Paper>

      {/* CONTENT / TIMELINE */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : filteredVersions.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No versions found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new release to start tracking history.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ position: 'relative', pl: { xs: 2, sm: 4 } }}>
          {/* Vertical Timeline Line */}
          <Box
            sx={{
              position: 'absolute',
              top: 15,
              bottom: 15,
              left: { xs: 23, sm: 39 },
              width: 2,
              bgcolor: 'divider'
            }}
          />

          <Stack spacing={4}>
            {filteredVersions.map((ver, index) => (
              <Box key={ver.id || ver._id || index} sx={{ position: 'relative', pl: { xs: 4, sm: 5 } }}>
                {/* Node Indicator */}
                <Avatar
                  sx={{
                    position: 'absolute',
                    left: { xs: -12, sm: -4 },
                    top: 12,
                    width: 32,
                    height: 32,
                    bgcolor: index === 0 ? '#5e35b1' : 'action.disabledBackground',
                    color: index === 0 ? '#fff' : 'text.secondary',
                    boxShadow: 1
                  }}
                >
                  <LocalOfferIcon fontSize="small" />
                </Avatar>

                {/* Release Card */}
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={2} spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                      <Chip label={ver.versionNumber} color={index === 0 ? 'primary' : 'default'} size="small" sx={{ fontWeight: 'bold' }} />
                      <Typography variant="h6" fontWeight="bold">
                        {ver.title || 'Untitled Release'}
                      </Typography>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      {ver.createdAt ? new Date(ver.createdAt).toLocaleString() : 'N/A'}
                    </Typography>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {/* Changelog Content */}
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.secondary">
                    Changelog
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', mb: 3 }}>
                    {ver.changelog || 'No detailed changelog provided.'}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  {/* Metadata & Actions Footer */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                      <Typography variant="caption" color="text.secondary">
                        Released by <strong>{ver.author || ver.uploadedBy || 'Developer'}</strong>
                      </Typography>

                      {ver.commitHash && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`commit: ${ver.commitHash.substring(0, 7)}`}
                          onClick={() => handleCopyHash(ver.commitHash!)}
                          onDelete={() => handleCopyHash(ver.commitHash!)}
                          deleteIcon={<Tooltip title="Copy Commit Hash"><ContentCopyIcon fontSize="small" /></Tooltip>}
                        />
                      )}

                      {ver.fileSize && (
                        <Typography variant="caption" color="text.secondary">
                          • {ver.fileSize}
                        </Typography>
                      )}
                    </Stack>

                    {ver.downloadUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        href={ver.downloadUrl}
                        target="_blank"
                      >
                        Download Source
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* NEW VERSION DIALOG */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Upload New Repository Version</DialogTitle>
        <form onSubmit={handleCreateVersion}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Version Number *"
                placeholder="e.g. v1.0.0"
                fullWidth
                required
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
              />
              <TextField
                label="Release Title *"
                placeholder="e.g. Initial Production Release"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextField
                label="Commit Hash"
                placeholder="e.g. 7f8a9b0"
                fullWidth
                value={commitHash}
                onChange={(e) => setCommitHash(e.target.value)}
              />
              <TextField
                label="Changelog"
                placeholder="List major features, bug fixes, or updates..."
                multiline
                rows={4}
                fullWidth
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !versionNumber.trim() || !title.trim()}
              sx={{ bgcolor: '#5e35b1', '&:hover': { bgcolor: '#4527a0' } }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Publish Release'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default RepositoryVersionHistoryPage;