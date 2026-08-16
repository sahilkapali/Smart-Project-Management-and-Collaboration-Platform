import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Stack, Avatar, AvatarGroup, 
  IconButton, CircularProgress, Alert, Menu, MenuItem, ListItemIcon, ListItemText, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Select, FormControl, InputLabel
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

// Icons
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import CodeIcon from '@mui/icons-material/Code';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Services & Modals
import { getRepositoryItems, deleteRepository } from '../../services/repository.service';
import { getProjects } from '../../services/project.service';
import CreateRepositoryModal from './CreateRepositoryModal';
import EditRepositoryModal from './EditRepositoryModal';

const getIconForType = (type?: string) => {
  switch (type) {
    case 'folder': return <FolderIcon sx={{ color: '#1e3a8a', fontSize: 32 }} />;
    case 'code': return <CodeIcon sx={{ color: '#1e3a8a', fontSize: 32 }} />;
    case 'pdf': return <PictureAsPdfIcon sx={{ color: '#d32f2f', fontSize: 32 }} />;
    case 'svg': return <ImageIcon sx={{ color: '#1976d2', fontSize: 32 }} />;
    case 'docx': return <DescriptionIcon sx={{ color: '#1976d2', fontSize: 32 }} />;
    case 'xlsx': return <TableChartIcon sx={{ color: '#2e7d32', fontSize: 32 }} />;
    default: return <FolderIcon sx={{ color: '#757575', fontSize: 32 }} />;
  }
};

const RepositoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Menu State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      setLoading(true);
      
      // Fetch repositories and active projects in parallel
      const [repoRes, projectRes] = await Promise.all([
        getRepositoryItems(),
        getProjects().catch(() => ({ success: false, data: [] }))
      ]);

      if (repoRes.success) setItems(repoRes.data);
      if (projectRes.success) setProjects(projectRes.data);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch repository data');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectFilterChange = (event: SelectChangeEvent) => {
    setSelectedProjectId(event.target.value as string);
  };

  // Filter items based on selected project
  const filteredItems = selectedProjectId === 'all'
    ? items
    : items.filter((item) => (item.project?._id || item.project) === selectedProjectId);

  // Selected project details
  const activeProject = projects.find((p) => p._id === selectedProjectId);

  // Menu Handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, repo: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRepo(repo);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRepo) return;
    try {
      setIsDeleting(true);
      await deleteRepository(selectedRepo._id);
      setIsDeleteDialogOpen(false);
      setSelectedRepo(null);
      loadPageData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete repository');
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh"><CircularProgress /></Box>;
  if (error) return <Box p={4}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: '1200px', mx: 'auto', boxSizing: 'border-box' }}>
      
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">Repository</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {activeProject ? activeProject.description || `Viewing repositories for ${activeProject.name}` : 'Manage project files, assets, and documentation'}
          </Typography>
        </Box>
        <Button 
          variant="contained" startIcon={<AddIcon />} onClick={() => setIsCreateModalOpen(true)}
          sx={{ bgcolor: '#5e35b1', textTransform: 'none', borderRadius: 2, px: 3, '&:hover': { bgcolor: '#4527a0' } }}
        >
          Create Repository
        </Button>
      </Stack>

      {/* Toolbar: Search Existing Projects Dropdown */}
      <Stack direction="row" justifyContent="flex-end" mb={4}>
        <FormControl size="small" sx={{ minWidth: 260, bgcolor: 'background.paper', borderRadius: 2 }}>
          <InputLabel id="project-search-select-label">Search / Select Project</InputLabel>
          <Select
            labelId="project-search-select-label"
            value={selectedProjectId}
            label="Search / Select Project"
            onChange={handleProjectFilterChange}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="all">
              <em>All Projects</em>
            </MenuItem>
            {projects.map((proj) => (
              <MenuItem key={proj._id} value={proj._id}>
                {proj.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No repositories found.</Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 3 }}>
          {filteredItems.map((item) => (
            <Card key={item._id} variant="outlined" sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ flexGrow: 1, p: 3, '&:last-child': { pb: 3 } }}>
                
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'grey.50', display: 'flex' }}>
                      {getIconForType(item.type)}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>{item.name}</Typography>
                  </Stack>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)} sx={{ color: 'text.secondary', mt: -0.5, mr: -1 }}>
                    <MoreVertIcon />
                  </IconButton>
                </Stack>

                <Typography variant="body2" color="text.secondary" mb={3} sx={{ minHeight: '40px' }}>
                  {item.description || 'No description provided.'}
                </Typography>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 30, height: 30, fontSize: '0.8rem' } }}>
                      {item.createdBy && (
                         <Avatar src={item.createdBy.avatar} alt={item.createdBy.name}>{item.createdBy.name?.charAt(0)}</Avatar>
                      )}
                    </AvatarGroup>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      / {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Options Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ elevation: 3, sx: { borderRadius: 2, minWidth: 150 } }}>
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon><EditIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Modal (No dropdown selection inside) */}
      <CreateRepositoryModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={loadPageData} 
        defaultProjectId={selectedProjectId !== 'all' ? selectedProjectId : ''}
      />

      {/* Edit Modal */}
      {selectedRepo && (
        <EditRepositoryModal 
          open={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          onSuccess={loadPageData} 
          repository={selectedRepo} 
        />
      )}

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Repository?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{selectedRepo?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsDeleteDialogOpen(false)} color="inherit" disabled={isDeleting}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default RepositoryPage;