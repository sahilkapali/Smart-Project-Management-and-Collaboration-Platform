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
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Frontend validation
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const loggedInUser = await login({
        email: email.trim(),
        password,
      });

      toast.success("Login successful!");

      console.log("Logged-in user:", loggedInUser);

      // Redirect after successful login
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please check your credentials.";

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
                Login
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Sign in to your account
              </Typography>
            </Box>

            <CustomInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <CustomInput
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
