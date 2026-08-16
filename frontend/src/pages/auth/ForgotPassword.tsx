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
import { forgotPassword } from "../../services/auth.service";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    // -----------------------------
    // Validation
    // -----------------------------

    if (!trimmedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(trimmedEmail);

      toast.success(
        response.message ||
          "If your account exists, an OTP has been sent to your email.",
      );

      // Go to reset password page
      navigate("/reset-password", {
        state: {
          email: trimmedEmail,
        },
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to send OTP. Please try again.";

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
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 430,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          boxShadow: "0 12px 35px rgba(15, 23, 42, 0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
            {/* Header */}
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ color: "text.primary" }}
              >
                Forgot Password?
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  lineHeight: 1.7,
                }}
              >
                Enter your registered email address and we'll send you a 6-digit
                OTP to reset your password.
              </Typography>
            </Box>

            {/* Email */}
            <CustomInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={loading}
            />

            {/* Send OTP */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                minHeight: 48,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>

            {/* Back to Login */}
            <Button
              type="button"
              variant="text"
              onClick={() => navigate("/login")}
              disabled={loading}
              sx={{
                fontWeight: 600,
              }}
            >
              Back to Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
