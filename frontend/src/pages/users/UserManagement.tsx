import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material/Select";

import { getUsers, updateUserRole } from "../../services/user.service";

import type { User, UserRole } from "../../types/user.types";

import { useAuth } from "../../context/AuthContext";

// ============================================================
// USER MANAGEMENT PAGE
// ============================================================

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // ==========================================================
  // LOAD USERS
  // ==========================================================

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load users:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // ==========================================================
  // UPDATE ROLE
  // ==========================================================

  const handleRoleChange = async (
    userId: string,
    event: SelectChangeEvent<UserRole>,
  ) => {
    const newRole = event.target.value as UserRole;

    try {
      setUpdatingUserId(userId);
      setError("");

      const updatedUser = await updateUserRole(userId, newRole);

      setUsers((previousUsers) =>
        previousUsers.map((existingUser) =>
          existingUser._id === updatedUser._id
            ? updatedUser
            : existingUser,
        ),
      );
    } catch (err: any) {
      console.error("Failed to update user role:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update user role.",
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">
            Loading users...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: {
              xs: "1.8rem",
              sm: "2.2rem",
              md: "2.4rem",
            },
            fontWeight: 700,
          }}
        >
          User Management
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Manage users and their system roles.
        </Typography>
      </Box>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void loadUsers()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ======================================================
          USER LIST
      ====================================================== */}

      <Stack spacing={2}>
        {users.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent
              sx={{
                minHeight: 250,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="text.secondary">
                No users found.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => {
            const isCurrentUser = currentUser?._id === user._id;

            const isUpdating = updatingUserId === user._id;

            return (
              <Card
                key={user._id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    spacing={2}
                    alignItems={{
                      xs: "flex-start",
                      md: "center",
                    }}
                    justifyContent="space-between"
                  >
                    {/* USER INFORMATION */}

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          wordBreak: "break-word",
                        }}
                      >
                        {user.firstName} {user.lastName}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {user.email}
                      </Typography>

                      {user.phone && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.25 }}
                        >
                          {user.phone}
                        </Typography>
                      )}
                    </Box>

                    {/* ROLE */}

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1}
                      alignItems={{
                        xs: "flex-start",
                        sm: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        Role
                      </Typography>

                      <Select
                        size="small"
                        value={user.role}
                        disabled={
                          isUpdating ||
                          (isCurrentUser && user.role === "ADMIN")
                        }
                        onChange={(event) =>
                          void handleRoleChange(user._id, event)
                        }
                        sx={{
                          minWidth: 180,
                        }}
                      >
                        <MenuItem value="ADMIN">
                          ADMIN
                        </MenuItem>

                        <MenuItem value="PROJECT_MANAGER">
                          PROJECT_MANAGER
                        </MenuItem>

                        <MenuItem value="TEAM_MEMBER">
                          TEAM_MEMBER
                        </MenuItem>
                      </Select>

                      {isUpdating && <CircularProgress size={22} />}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>
    </Box>
  );
};

export default UserManagementPage;