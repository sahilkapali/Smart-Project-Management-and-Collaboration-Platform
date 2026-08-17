import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getRepositories,
  deleteRepository,
} from "../../services/repository.service";
import type { Repository } from "../../types/repository.types";
import CreateRepositoryModal from "./CreateRepositoryModal";
import EditRepositoryModal from "./EditRepositoryModal";

const RepositoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editRepo, setEditRepo] = useState<Repository | null>(null);

  const fetchRepositories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRepositories();
      setRepositories(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load repositories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  const handleDelete = async (id: string | undefined) => {
    if (
      !id ||
      !window.confirm("Are you sure you want to delete this repository?")
    )
      return;
    try {
      await deleteRepository(id);
      fetchRepositories(); // Refresh list
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete repository.");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" fontWeight="bold">
          Repositories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateOpen(true)}
          sx={{ bgcolor: "#5e35b1", "&:hover": { bgcolor: "#4527a0" } }}
        >
          New Repository
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : repositories.length === 0 && !error ? (
        <Box textAlign="center" py={10} bgcolor="action.hover" borderRadius={3}>
          <FolderIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No repositories found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first repository to get started.
          </Typography>
          <Button variant="outlined" onClick={() => setIsCreateOpen(true)}>
            Create Repository
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {repositories.map((repo) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={repo.id || repo._id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 4 },
                }}
              >
                <CardContent
                  sx={{ flexGrow: 1, cursor: "pointer" }}
                  onClick={() => navigate(`/repository/${repo.id || repo._id}`)}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      noWrap
                      title={repo.name}
                    >
                      {repo.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={repo.visibility || "Private"}
                      variant="outlined"
                      color={
                        repo.visibility === "public" ? "success" : "default"
                      }
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 2,
                    }}
                  >
                    {repo.description || "No description provided."}
                  </Typography>
                  {repo.language && (
                    <Chip
                      size="small"
                      label={repo.language}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </CardContent>
                <CardActions
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => setEditRepo(repo)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(repo.id || repo._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modals */}
      <CreateRepositoryModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchRepositories}
      />
      <EditRepositoryModal
        open={Boolean(editRepo)}
        onClose={() => setEditRepo(null)}
        onSuccess={fetchRepositories}
        repository={editRepo}
      />
    </Box>
  );
};

export default RepositoryPage;
