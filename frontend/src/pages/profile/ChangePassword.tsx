import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import toast from "react-hot-toast";

import CustomInput from "../../components/CustomInput";
import { changeUserPassword } from "../../services/user.service";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);

  // ==========================================
  // Submit
  // ==========================================

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate current password
    if (!currentPassword) {
      toast.error("Current password is required.");
      return;
    }

    // Validate new password
    if (!newPassword) {
      toast.error("New password is required.");
      return;
    }

    // Minimum password length
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    // Confirm password
    if (!confirmPassword) {
      toast.error("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    // Prevent same password
    if (currentPassword === newPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    try {
      setSaving(true);

      const response = await changeUserPassword({
        currentPassword,
        newPassword,
      });

      toast.success(response.message || "Password changed successfully.");

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Return to profile
      navigate("/profile");
    } catch (error: any) {
      console.error("Change password error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to change password.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          maxWidth: 520,
          mx: "auto",
        }}
      >
        {/* Heading */}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Change Password
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Update your account password securely.
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
              {/* Current Password */}

              <CustomInput
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />

              {/* New Password */}

              <CustomInput
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />

              {/* Confirm Password */}

              <CustomInput
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />

              {/* Password requirement */}

              <Typography variant="caption" color="text.secondary">
                Password must contain at least 6 characters.
              </Typography>

              {/* Buttons */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
                sx={{ pt: 1 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={saving}
                >
                  {saving ? "Changing..." : "Change Password"}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  size="large"
                  fullWidth
                  disabled={saving}
                  onClick={() => navigate("/profile")}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ChangePassword;
