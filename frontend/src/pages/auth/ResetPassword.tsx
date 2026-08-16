import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
import { resetPassword } from "../../services/auth.service";

interface ResetPasswordLocationState {
  email?: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as ResetPasswordLocationState | null;

  const [email, setEmail] = useState(state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!otp.trim()) {
      toast.error("Please enter the OTP.");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      toast.success(response.message || "Password reset successfully.");

      navigate("/login", {
        replace: true,
      });
    } catch (error: any) {
      console.error("Reset password error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to reset password. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        backgroundColor: "background.default",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 450,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Reset Password
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Enter the OTP sent to your email and create a new password.
              </Typography>
            </Box>

            <CustomInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <CustomInput
              label="OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
            />

            <CustomInput
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />

            <CustomInput
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>

            <Button
              type="button"
              variant="text"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;
