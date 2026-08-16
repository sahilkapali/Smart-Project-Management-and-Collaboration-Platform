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

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(email.trim());

      toast.success(response.message || "OTP sent successfully.");

      // Pass email to the reset-password page
      navigate("/reset-password", {
        state: {
          email: email.trim(),
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
        backgroundColor: "background.default",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Forgot Password
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Enter your email address and we'll send you an OTP to reset your
                password.
              </Typography>
            </Box>

            <CustomInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPassword;
