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

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    // Email validation
    if (!trimmedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // OTP validation
    if (!trimmedOtp) {
      toast.error("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      toast.error("OTP must be exactly 6 digits.");
      return;
    }

    // New password validation
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    // Confirm password validation
    if (!confirmPassword) {
      toast.error("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({
        email: trimmedEmail,
        otp: trimmedOtp,
        newPassword,
      });

      if (!response.success) {
        toast.error(
          response.message || "Unable to reset password."
        );
        return;
      }

      toast.success(
        response.message ||
          "Password reset successfully."
      );

      // Redirect to login after successful password reset
      navigate("/login", {
        replace: true,
      });
    } catch (error: any) {
      console.error(
        "Reset password error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to reset password. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
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
          <Stack
            component="form"
            spacing={2.5}
            onSubmit={handleSubmit}
          >
            {/* Header */}
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
              >
                Reset Password
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Enter the 6-digit OTP sent to your
                email and create a new password.
              </Typography>
            </Box>

            {/* Email */}
            <CustomInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />

            {/* OTP */}
            <CustomInput
              label="OTP"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              inputProps={{
                inputMode: "numeric",
                maxLength: 6,
              }}
            />

            {/* New Password */}
            <CustomInput
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
            />

            {/* Confirm Password */}
            <CustomInput
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
            />

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading
                ? "Resetting Password..."
                : "Reset Password"}
            </Button>

            {/* Back */}
            <Button
              type="button"
              variant="text"
              disabled={loading}
              onClick={() =>
                navigate("/login")
              }
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
