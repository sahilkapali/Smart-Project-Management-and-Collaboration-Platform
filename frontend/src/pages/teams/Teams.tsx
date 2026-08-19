import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import PersonRemoveRoundedIcon from "@mui/icons-material/PersonRemoveRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

import {
  addTeamMember,
  removeTeamMember,
  createTeam,
  deleteTeam,
  getMyTeams,
  updateTeam,
} from "../../services/team.service";

import type { Team, TeamMember } from "../../types/team.types";
import type { UserRole } from "../../types/user.types";

type TeamFormMode = "create" | "edit";

const ADMIN_ROLE = "ADMIN";
const PROJECT_MANAGER_ROLE = "PROJECT_MANAGER";

const Teams = () => {
  const { user } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamFormMode, setTeamFormMode] = useState<TeamFormMode>("create");

  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");

  const [savingTeam, setSavingTeam] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState(false);

  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberDialogMode, setMemberDialogMode] = useState<"add" | "remove">(
    "add",
  );

  const [memberTeam, setMemberTeam] = useState<Team | null>(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsTeam, setDetailsTeam] = useState<Team | null>(null);

  // ============================================================
  // ROLE
  // ============================================================

  const userRole = useMemo(() => {
    return String(
      (user as { role?: UserRole | string } | null)?.role ?? "",
    ).toUpperCase();
  }, [user]);

  const isAdmin = userRole === ADMIN_ROLE;

  const isProjectManager = userRole === PROJECT_MANAGER_ROLE;

  const canManageTeams = isAdmin || isProjectManager;

  // ============================================================
  // LOAD TEAMS
  // ============================================================

  const loadTeams = async () => {
    try {
      setLoading(true);
      setPageError("");

      const data = await getMyTeams();

      setTeams(data);
    } catch (error: any) {
      console.error("Failed to load teams:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load teams.";

      setPageError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTeams();
  }, []);

  // ============================================================
  // CREATE TEAM
  // ============================================================

  const openCreateDialog = () => {
    if (!canManageTeams) {
      toast.error("Only Admin and Project Manager can create teams.");
      return;
    }

    setTeamFormMode("create");
    setTeamName("");
    setTeamDescription("");
    setSelectedTeam(null);
    setTeamDialogOpen(true);
  };

  // ============================================================
  // EDIT TEAM
  // ============================================================

  const openEditDialog = (team: Team) => {
    if (!canManageTeams) {
      toast.error("You do not have permission to edit teams.");
      return;
    }

    setSelectedTeam(team);

    setTeamFormMode("edit");
    setTeamName(team.name);
    setTeamDescription(team.description ?? "");

    setTeamDialogOpen(true);
  };

  // ============================================================
  // SAVE TEAM
  // ============================================================

  const handleSaveTeam = async () => {
    const trimmedName = teamName.trim();
    const trimmedDescription = teamDescription.trim();

    if (!trimmedName) {
      toast.error("Team name is required.");
      return;
    }

    if (trimmedName.length < 3) {
      toast.error("Team name must be at least 3 characters.");
      return;
    }

    if (trimmedName.length > 100) {
      toast.error("Team name cannot exceed 100 characters.");
      return;
    }

    if (!canManageTeams) {
      toast.error("You do not have permission to manage teams.");
      return;
    }

    try {
      setSavingTeam(true);

      if (teamFormMode === "create") {
        const createdTeam = await createTeam({
          name: trimmedName,
          description: trimmedDescription || undefined,
        });

        setTeams((previousTeams) => [createdTeam, ...previousTeams]);

        toast.success("Team created successfully.");
      } else {
        if (!selectedTeam) {
          toast.error("No team selected.");
          return;
        }

        const updatedTeam = await updateTeam(selectedTeam._id, {
          name: trimmedName,
          description: trimmedDescription,
        });

        setTeams((previousTeams) =>
          previousTeams.map((team) =>
            team._id === updatedTeam._id ? updatedTeam : team,
          ),
        );

        setDetailsTeam((previousTeam) =>
          previousTeam?._id === updatedTeam._id ? updatedTeam : previousTeam,
        );

        toast.success("Team updated successfully.");
      }

      setTeamDialogOpen(false);
      setSelectedTeam(null);
      setTeamName("");
      setTeamDescription("");
    } catch (error: any) {
      console.error("Save team error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save team.";

      toast.error(message);
    } finally {
      setSavingTeam(false);
    }
  };

  // ============================================================
  // DELETE TEAM
  // ============================================================

  const openDeleteDialog = (team: Team) => {
    if (!canManageTeams) {
      toast.error("You do not have permission to delete teams.");
      return;
    }

    setTeamToDelete(team);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) {
      return;
    }

    try {
      setDeletingTeam(true);

      await deleteTeam(teamToDelete._id);

      setTeams((previousTeams) =>
        previousTeams.filter((team) => team._id !== teamToDelete._id),
      );

      if (detailsTeam?._id === teamToDelete._id) {
        setDetailsDialogOpen(false);
        setDetailsTeam(null);
      }

      toast.success("Team deleted successfully.");

      setDeleteDialogOpen(false);
      setTeamToDelete(null);
    } catch (error: any) {
      console.error("Delete team error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete team.";

      toast.error(message);
    } finally {
      setDeletingTeam(false);
    }
  };

  // ============================================================
  // TEAM DETAILS
  // ============================================================

  const handleViewDetails = (team: Team) => {
    setDetailsTeam(team);
    setDetailsDialogOpen(true);
  };

  // ============================================================
  // ADD MEMBER
  // ============================================================

  const openAddMemberDialog = (team: Team) => {
    if (!canManageTeams) {
      toast.error("Only Admin and Project Manager can add members.");
      return;
    }

    setMemberTeam(team);
    setMemberDialogMode("add");
    setMemberEmail("");
    setMemberDialogOpen(true);
  };

  // ============================================================
  // REMOVE MEMBER
  // ============================================================

  const openRemoveMemberDialog = (team: Team) => {
    if (!canManageTeams) {
      toast.error("Only Admin and Project Manager can remove members.");
      return;
    }

    setMemberTeam(team);
    setMemberDialogMode("remove");
    setMemberEmail("");
    setMemberDialogOpen(true);
  };

  // ============================================================
  // MEMBER ACTION
  // ============================================================

  const handleMemberAction = async () => {
    if (!memberTeam) {
      return;
    }

    const trimmedEmail = memberEmail.trim();

    if (!trimmedEmail) {
      toast.error("Please enter user email.");
      return;
    }

    if (!canManageTeams) {
      toast.error("You do not have permission to manage members.");
      return;
    }

    try {
      setMemberLoading(true);

      let updatedTeam: Team;

      if (memberDialogMode === "add") {
        updatedTeam = await addTeamMember(memberTeam._id, {
          email: trimmedEmail,
        });

        toast.success("Team member added successfully.");
      } else {
        updatedTeam = await removeTeamMember(memberTeam._id, trimmedEmail);

        toast.success("Team member removed successfully.");
      }

      setTeams((previousTeams) =>
        previousTeams.map((team) =>
          team._id === updatedTeam._id ? updatedTeam : team,
        ),
      );

      setDetailsTeam((previousTeam) =>
        previousTeam?._id === updatedTeam._id ? updatedTeam : previousTeam,
      );

      setMemberDialogOpen(false);
      setMemberTeam(null);
      setMemberEmail("");
    } catch (error: any) {
      console.error("Member action error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update team members.";

      toast.error(message);
    } finally {
      setMemberLoading(false);
    }
  };

  // ============================================================
  // COPY TEAM ID
  // ============================================================

  const copyTeamId = async (teamId: string) => {
    try {
      await navigator.clipboard.writeText(teamId);
      toast.success("Team ID copied.");
    } catch {
      toast.error("Could not copy team ID.");
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getMemberName = (member: TeamMember) => {
    const fullName = `${member.firstName ?? ""} ${
      member.lastName ?? ""
    }`.trim();

    return fullName || member.email;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">Loading teams...</Typography>
        </Stack>
      </Box>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1600px",
        mx: "auto",
      }}
    >
      {/* ====================================================== */}
      {/* HEADER                                                  */}
      {/* ====================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              mb: 0.5,
              fontSize: {
                xs: "1.75rem",
                sm: "2rem",
                md: "2.125rem",
              },
            }}
          >
            Teams
          </Typography>

          <Typography color="text.secondary">
            View and manage your project teams.
          </Typography>

          <Chip
            size="small"
            label={`Role: ${userRole || "UNKNOWN"}`}
            sx={{ mt: 1 }}
          />
        </Box>

        {canManageTeams && (
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openCreateDialog}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              minHeight: 42,
            }}
          >
            Create Team
          </Button>
        )}
      </Stack>

      {/* ====================================================== */}
      {/* ERROR                                                   */}
      {/* ====================================================== */}

      {pageError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void loadTeams()}
            >
              Retry
            </Button>
          }
        >
          {pageError}
        </Alert>
      )}

      {/* ====================================================== */}
      {/* EMPTY STATE                                             */}
      {/* ====================================================== */}

      {!pageError && teams.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 3,
              sm: 5,
            },
            textAlign: "center",
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
          }}
        >
          <GroupsRoundedIcon
            sx={{
              fontSize: 60,
              color: "text.secondary",
              mb: 1,
            }}
          />

          <Typography variant="h6" fontWeight={700}>
            No teams found
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
              mb: 2,
            }}
          >
            You are not currently a member of any team.
          </Typography>

          {canManageTeams && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openCreateDialog}
              sx={{
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Create Your First Team
            </Button>
          )}
        </Paper>
      )}

      {/* ====================================================== */}
      {/* TEAM CARDS                                              */}
      {/* ====================================================== */}

      {teams.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2.5,
          }}
        >
          {teams.map((team) => (
            <Card
              key={team._id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: 1,
                borderColor: "divider",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                    }}
                  >
                    <GroupsRoundedIcon />
                  </Box>

                  <Chip
                    size="small"
                    label={`${team.members?.length ?? 0} member${
                      (team.members?.length ?? 0) === 1 ? "" : "s"
                    }`}
                  />
                </Stack>

                <Typography variant="h6" fontWeight={800} sx={{ mt: 2 }}>
                  {team.name}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.8,
                    minHeight: 42,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {team.description || "No team description provided."}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Team Owner
                </Typography>

                <Typography fontWeight={600} sx={{ mt: 0.3 }}>
                  {team.owner ? getMemberName(team.owner) : "Unknown"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {team.owner?.email || "No email"}
                </Typography>
              </CardContent>

              {/* ================================================= */}
              {/* ACTIONS                                            */}
              {/* ================================================= */}

              <Box
                sx={{
                  px: 2,
                  pb: 2,
                }}
              >
                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<VisibilityRoundedIcon />}
                    onClick={() => handleViewDetails(team)}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                    }}
                  >
                    View Team Details
                  </Button>

                  {canManageTeams && (
                    <>
                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<EditRoundedIcon />}
                          onClick={() => openEditDialog(team)}
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                          }}
                        >
                          Edit
                        </Button>

                        <Tooltip title="Delete team">
                          <IconButton
                            color="error"
                            onClick={() => openDeleteDialog(team)}
                            sx={{
                              border: 1,
                              borderColor: "divider",
                              borderRadius: 2,
                            }}
                          >
                            <DeleteRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<PersonAddRoundedIcon />}
                          onClick={() => openAddMemberDialog(team)}
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                          }}
                        >
                          Add Member
                        </Button>

                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={<PersonRemoveRoundedIcon />}
                          onClick={() => openRemoveMemberDialog(team)}
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                          }}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* ====================================================== */}
      {/* CREATE / EDIT TEAM DIALOG                               */}
      {/* ====================================================== */}

      <Dialog
        open={teamDialogOpen}
        onClose={() => {
          if (!savingTeam) {
            setTeamDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {teamFormMode === "create" ? "Create Team" : "Edit Team"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Team name"
              placeholder="Development Team"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              disabled={savingTeam}
              autoFocus
            />

            <TextField
              fullWidth
              label="Description"
              placeholder="Describe this team..."
              value={teamDescription}
              onChange={(event) => setTeamDescription(event.target.value)}
              disabled={savingTeam}
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={() => setTeamDialogOpen(false)}
            disabled={savingTeam}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() => void handleSaveTeam()}
            disabled={savingTeam}
            sx={{ textTransform: "none" }}
          >
            {savingTeam ? (
              <CircularProgress size={22} color="inherit" />
            ) : teamFormMode === "create" ? (
              "Create Team"
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====================================================== */}
      {/* TEAM DETAILS DIALOG                                     */}
      {/* ====================================================== */}

      <Dialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setDetailsTeam(null);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {detailsTeam?.name || "Team Details"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Team information and members
            </Typography>
          </Box>

          <IconButton
            onClick={() => {
              setDetailsDialogOpen(false);
              setDetailsTeam(null);
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {detailsTeam && (
            <Stack spacing={3}>
              {/* TEAM ID */}

              {canManageTeams && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Team ID
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 0.5 }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        wordBreak: "break-all",
                      }}
                    >
                      {detailsTeam._id}
                    </Typography>

                    <Tooltip title="Copy team ID">
                      <IconButton
                        size="small"
                        onClick={() => void copyTeamId(detailsTeam._id)}
                      >
                        <ContentCopyRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              )}

              {/* DESCRIPTION */}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>

                <Typography sx={{ mt: 0.5 }}>
                  {detailsTeam.description || "No description provided."}
                </Typography>
              </Box>

              {/* OWNER */}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Team Owner
                </Typography>

                <Typography fontWeight={700} sx={{ mt: 0.5 }}>
                  {detailsTeam.owner
                    ? getMemberName(detailsTeam.owner)
                    : "Unknown"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {detailsTeam.owner?.email || ""}
                </Typography>

                {detailsTeam.owner?.role && (
                  <Chip
                    size="small"
                    label={detailsTeam.owner.role}
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>

              {/* DATES */}

              {canManageTeams && (
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={3}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Created At
                    </Typography>

                    <Typography sx={{ mt: 0.5 }}>
                      {detailsTeam.createdAt
                        ? new Date(detailsTeam.createdAt).toLocaleString()
                        : "Not available"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Updated At
                    </Typography>

                    <Typography sx={{ mt: 0.5 }}>
                      {detailsTeam.updatedAt
                        ? new Date(detailsTeam.updatedAt).toLocaleString()
                        : "Not available"}
                    </Typography>
                  </Box>
                </Stack>
              )}

              {/* MEMBERS */}

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <Typography variant="subtitle1" fontWeight={800}>
                    Members
                  </Typography>

                  <Chip
                    size="small"
                    label={`${detailsTeam.members?.length ?? 0}`}
                  />
                </Stack>

                <Stack spacing={1}>
                  {detailsTeam.members?.length ? (
                    detailsTeam.members.map((member) => (
                      <Paper
                        key={member._id}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 2,
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={2}
                        >
                          <Box
                            sx={{
                              minWidth: 0,
                            }}
                          >
                            <Typography fontWeight={700}>
                              {getMemberName(member)}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {member.email}
                            </Typography>
                          </Box>

                          <Chip size="small" label={member.role} />
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      No members found.
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            onClick={() => {
              setDetailsDialogOpen(false);
              setDetailsTeam(null);
            }}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====================================================== */}
      {/* DELETE CONFIRMATION                                     */}
      {/* ====================================================== */}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deletingTeam) {
            setDeleteDialogOpen(false);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Team?</DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete{" "}
            <strong>{teamToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deletingTeam}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeleteTeam()}
            disabled={deletingTeam}
            sx={{ textTransform: "none" }}
          >
            {deletingTeam ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Delete Team"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====================================================== */}
      {/* MEMBER DIALOG                                           */}
      {/* ====================================================== */}

      <Dialog
        open={memberDialogOpen}
        onClose={() => {
          if (!memberLoading) {
            setMemberDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {memberDialogMode === "add"
            ? "Add Team Member"
            : "Remove Team Member"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Team: <strong>{memberTeam?.name}</strong>
            </Typography>

            <TextField
              fullWidth
              label="User Email"
              placeholder="Enter user registered email"
              value={memberEmail}
              onChange={(event) => setMemberEmail(event.target.value)}
              disabled={memberLoading}
              helperText={
                memberDialogMode === "add"
                  ? "Enter the MongoDB registered email of the person you want to add."
                  : "Enter the MongoDB registered email of the member you want to remove."
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={() => setMemberDialogOpen(false)}
            disabled={memberLoading}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color={memberDialogMode === "remove" ? "error" : "primary"}
            onClick={() => void handleMemberAction()}
            disabled={memberLoading}
            sx={{ textTransform: "none" }}
          >
            {memberLoading ? (
              <CircularProgress size={22} color="inherit" />
            ) : memberDialogMode === "add" ? (
              "Add Member"
            ) : (
              "Remove Member"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teams;
