import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FolderIcon from "@mui/icons-material/Folder";
import GitHubIcon from "@mui/icons-material/GitHub";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  deleteRepository,
  getRepositories,
} from "../../services/repository.service";
import type { Repository } from "../../types/repository.types";

import CreateRepositoryModal from "./CreateRepositoryModal";
import EditRepositoryModal from "./EditRepositoryModal";

const RepositoryPage: React.FC = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editRepo, setEditRepo] = useState<Repository | null>(null);
  const [deleteConfirmRepo, setDeleteConfirmRepo] = useState<Repository | null>(
    null,
  );

  // Loading states
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // =====================================================
  // FETCH REPOSITORIES
  // =====================================================
  const fetchRepositories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getRepositories();
      setRepositories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load repositories:", err);
      setError(err?.response?.data?.message || "Failed to load repositories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  // =====================================================
  // DELETE REPOSITORY
  // =====================================================
  const handleDelete = async () => {
    const repositoryId = deleteConfirmRepo?._id || deleteConfirmRepo?.id;
    if (!repositoryId) return;

    try {
      setDeletingId(repositoryId);
      await deleteRepository(repositoryId);

      setRepositories((current) =>
        current.filter((repo) => (repo._id || repo.id) !== repositoryId),
      );

      setSnackbar({
        open: true,
        message: "Repository deleted successfully.",
        severity: "success",
      });
    } catch (err: any) {
      console.error("Failed to delete repository:", err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Failed to delete repository.",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
      setDeleteConfirmRepo(null);
    }
  };

  // =====================================================
  // SEARCH FILTERING
  // =====================================================
  const filteredRepositories = repositories.filter((repo) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      repo.name.toLowerCase().includes(query) ||
      (repo.description && repo.description.toLowerCase().includes(query))
    );
  });

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
            Repositories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your project repositories and version releases.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateOpen(true)}
          sx={{
            bgcolor: "#5e35b1",
            textTransform: "none",
            borderRadius: 2,
            px: 2.5,
            "&:hover": { bgcolor: "#4527a0" },
          }}
        >
          New Repository
        </Button>
      </Stack>

      {/* SEARCH BAR */}
      {repositories.length > 0 && (
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Search repositories by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: 500,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      )}

      {/* ERROR ALERT */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* LOADING */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={10}>
          <CircularProgress sx={{ color: "#5e35b1" }} />
        </Box>
      ) : repositories.length === 0 && !error ? (
        /* EMPTY STATE */
        <Box
          textAlign="center"
          py={10}
          px={3}
          bgcolor="action.hover"
          borderRadius={3}
        >
          <FolderIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            No repositories found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first repository to get started.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setIsCreateOpen(true)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Create Repository
          </Button>
        </Box>
      ) : (
        /* REPOSITORY GRID */
        <Grid container spacing={3}>
          {filteredRepositories.map((repo) => {
            const repositoryId = repo._id || repo.id;
            const projectName =
              typeof repo.project === "object" ? repo.project?.name : null;

            return (
              <Grid
                size={{ xs: 12, sm: 6, md: 4 }}
                key={repositoryId || repo.name}
              >
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      cursor: repositoryId ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (repositoryId) {
                        navigate(`/repository/${repositoryId}`);
                      }
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                      mb={1}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        noWrap
                        title={repo.name}
                        sx={{ minWidth: 0, flex: 1 }}
                      >
                        {repo.name}
                      </Typography>

                      {projectName && (
                        <Chip
                          size="small"
                          label={projectName}
                          variant="outlined"
                          color="secondary"
                        />
                      )}
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
                        minHeight: 40,
                      }}
                    >
                      {repo.description || "No description provided."}
                    </Typography>

                    {repo.githubUrl && (
                      <Chip
                        size="small"
                        icon={<GitHubIcon fontSize="small" />}
                        label="GitHub"
                        color="primary"
                        variant="outlined"
                        component="a"
                        href={repo.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </CardContent>

                  <CardActions
                    sx={{
                      borderTop: "1px solid",
                      borderColor: "divider",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1,
                    }}
                  >
                    <Tooltip title="Version History">
                      <IconButton
                        size="small"
                        color="default"
                        sx={{ color: "action.active" }}
                        disabled={!repositoryId}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (repositoryId) {
                            navigate(`/repository/${repositoryId}/versions`);
                          }
                        }}
                        aria-label="View version history"
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit Repository">
                        <IconButton
                          size="small"
                          color="primary"
                          disabled={!repositoryId}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (repositoryId) setEditRepo(repo);
                          }}
                          aria-label="Edit repository"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Repository">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={
                            !repositoryId || deletingId === repositoryId
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteConfirmRepo(repo);
                          }}
                          aria-label="Delete repository"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* CREATE REPOSITORY MODAL */}
      <CreateRepositoryModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={async () => {
          await fetchRepositories();
          setIsCreateOpen(false);
        }}
      />

      {/* EDIT REPOSITORY MODAL */}
      {editRepo && (
        <EditRepositoryModal
          open={true}
          onClose={() => setEditRepo(null)}
          onSuccess={async () => {
            await fetchRepositories();
            setEditRepo(null);
          }}
          repository={editRepo}
        />
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={Boolean(deleteConfirmRepo)}
        onClose={() => setDeleteConfirmRepo(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Delete Repository?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{deleteConfirmRepo?.name}</strong>? This action cannot be
            undone and will delete all files and versions associated with it.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteConfirmRepo(null)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={Boolean(deletingId)}
            sx={{ borderRadius: 2 }}
          >
            {deletingId ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* GENERAL NOTIFICATION */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RepositoryPage;
