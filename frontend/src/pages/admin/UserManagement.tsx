import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material/Select";

import { getUsers, updateUserRole } from "../../services/user.service";

import type { User, UserRole } from "../../types/user.types";

import PageHeader from "../../components/PageHeader";

// ============================================================
// ROLE LABEL
// ============================================================

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "ADMIN":
      return "Admin";

    case "PROJECT_MANAGER":
      return "Team Lead";

    case "TEAM_MEMBER":
      return "Member";

    default:
      return role;
  }
};

// ============================================================
// USER MANAGEMENT
// ============================================================

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  // ==========================================================
  // LOAD USERS
  // ==========================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUsers();

      setUsers(data);
    } catch (err: any) {
      console.error("Failed to load users:", err);

      setError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadUsers();
  }, []);

  // ==========================================================
  // ROLE CHANGE
  // ==========================================================

  const handleRoleChange = async (userId: string, event: SelectChangeEvent) => {
    const role = event.target.value as UserRole;

    try {
      setUpdatingUserId(userId);
      setError(null);
      setSuccess(null);

      const updatedUser = await updateUserRole(userId, role);

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === updatedUser._id ? updatedUser : user,
        ),
      );

      setSuccess("User role updated successfully.");
    } catch (err: any) {
      console.error("Failed to update user role:", err);

      setError(err?.response?.data?.message || "Failed to update user role.");
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle="Manage users and their system roles."
      />

      {/* ====================================================
          ALERTS
      ==================================================== */}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* ====================================================
          USER TABLE
      ==================================================== */}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>

              <TableCell>
                <strong>Email</strong>
              </TableCell>

              <TableCell>
                <strong>Role</strong>
              </TableCell>

              <TableCell>
                <strong>Status</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  {/* NAME */}

                  <TableCell>
                    <Typography fontWeight={600}>
                      {user.firstName} {user.lastName}
                    </Typography>
                  </TableCell>

                  {/* EMAIL */}

                  <TableCell>{user.email}</TableCell>

                  {/* ROLE */}

                  <TableCell>
                    <FormControl
                      size="small"
                      sx={{
                        minWidth: 160,
                      }}
                    >
                      <InputLabel>Role</InputLabel>

                      <Select
                        value={user.role}
                        label="Role"
                        disabled={updatingUserId === user._id}
                        onChange={(event) =>
                          void handleRoleChange(user._id, event)
                        }
                      >
                        <MenuItem value="ADMIN">
                          {getRoleLabel("ADMIN")}
                        </MenuItem>

                        <MenuItem value="PROJECT_MANAGER">
                          {getRoleLabel("PROJECT_MANAGER")}
                        </MenuItem>

                        <MenuItem value="TEAM_MEMBER">
                          {getRoleLabel("TEAM_MEMBER")}
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {updatingUserId === user._id && (
                      <CircularProgress
                        size={18}
                        sx={{
                          ml: 1,
                          verticalAlign: "middle",
                        }}
                      />
                    )}
                  </TableCell>

                  {/* STATUS */}

                  <TableCell>
                    {user.active === false ? (
                      <Typography color="error">Inactive</Typography>
                    ) : (
                      <Typography color="success.main">Active</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserManagement;
