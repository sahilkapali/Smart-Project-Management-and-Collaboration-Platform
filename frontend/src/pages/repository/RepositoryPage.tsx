import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FolderIcon from "@mui/icons-material/Folder";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // Edit modal
  const [editRepo, setEditRepo] = useState<Repository | null>(null);

  // Delete loading
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

  const handleDelete = async (repositoryId?: string) => {
    if (!repositoryId) {
      setSnackbar({
        open: true,
        message: "Repository ID is missing.",
        severity: "error",
      });

      return;
    }

    try {
      setDeletingId(repositoryId);

      await deleteRepository(repositoryId);

      // Remove repository immediately from UI
      setRepositories((currentRepositories) =>
        currentRepositories.filter((repo) => repo._id !== repositoryId),
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
    }
  };

  // =====================================================
  // CLOSE SNACKBAR
  // =====================================================

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbar((previous) => ({
      ...previous,
      open: false,
    }));
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      {/* =================================================
          PAGE HEADER
      ================================================= */}

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
            Manage your project repositories.
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
            "&:hover": {
              bgcolor: "#4527a0",
            },
          }}
        >
          New Repository
        </Button>
      </Stack>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={10}>
          <CircularProgress />
        </Box>
      ) : repositories.length === 0 && !error ? (
        /* =================================================
           EMPTY STATE
        ================================================= */

        <Box
          textAlign="center"
          py={10}
          px={3}
          bgcolor="action.hover"
          borderRadius={3}
        >
          <FolderIcon
            sx={{
              fontSize: 60,
              color: "text.secondary",
              mb: 2,
            }}
          />

          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            No repositories found
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first repository to get started.
          </Typography>

          <Button
            variant="outlined"
            onClick={() => setIsCreateOpen(true)}
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Create Repository
          </Button>
        </Box>
      ) : (
        /* =================================================
           REPOSITORY GRID
        ================================================= */

        <Grid container spacing={3}>
          {repositories.map((repo) => {
            const repositoryId = repo._id;

            return (
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
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
                  {/* =================================================
                      REPOSITORY INFORMATION
                  ================================================= */}

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
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {repo.name}
                      </Typography>

                      {/* Backend repository model does not
                          contain visibility, so don't use it here. */}
                      <Chip
                        size="small"
                        label="Repository"
                        variant="outlined"
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
                        minHeight: 40,
                      }}
                    >
                      {repo.description || "No description provided."}
                    </Typography>

                    {repo.githubUrl && (
                      <Chip
                        size="small"
                        label="GitHub"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </CardContent>

                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <CardActions
                    sx={{
                      borderTop: "1px solid",
                      borderColor: "divider",
                      justifyContent: "flex-end",
                      px: 2,
                      py: 1,
                    }}
                  >
                    {/* EDIT */}

                    <IconButton
                      size="small"
                      color="primary"
                      disabled={!repositoryId}
                      onClick={(event) => {
                        event.stopPropagation();

                        if (repositoryId) {
                          setEditRepo(repo);
                        }
                      }}
                      aria-label="Edit repository"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    {/* DELETE */}

                    <IconButton
                      size="small"
                      color="error"
                      disabled={!repositoryId || deletingId === repositoryId}
                      onClick={(event) => {
                        event.stopPropagation();

                        handleDelete(repositoryId);
                      }}
                      aria-label="Delete repository"
                    >
                      {deletingId === repositoryId ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <DeleteIcon fontSize="small" />
                      )}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* =================================================
          CREATE REPOSITORY MODAL
      ================================================= */}

      <CreateRepositoryModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={async () => {
          await fetchRepositories();
          setIsCreateOpen(false);
        }}
      />

      {/* =================================================
          EDIT REPOSITORY MODAL

          IMPORTANT:
          Only render this component when editRepo is
          actually available. This fixes:

          Type 'Repository | null' is not assignable
          to type 'Repository'
      ================================================= */}

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

      {/* =================================================
          DELETE / GENERAL NOTIFICATION
      ================================================= */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RepositoryPage;