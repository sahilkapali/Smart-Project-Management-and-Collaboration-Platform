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

const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // -----------------------------
    // Frontend validation
    // -----------------------------

    if (!firstName.trim()) {
      toast.error("Please enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      toast.error("Please enter your last name.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!password) {
      toast.error("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const registeredUser = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        ...(phone.trim() && {
          phone: phone.trim(),
        }),
      });

      console.log("Registered user:", registeredUser);

      toast.success("Registration successful!");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error: any) {
      console.error("Registration error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";

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
          maxWidth: 500,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
            {/* Header */}

            <Box>
              <Typography variant="h4" fontWeight={700}>
                Create Account
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Register for the Smart Project Management Platform
              </Typography>
            </Box>

            {/* First Name */}

            <CustomInput
              label="First Name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />

            {/* Last Name */}

            <CustomInput
              label="Last Name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />

            {/* Email */}

            <CustomInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            {/* Phone */}

            <CustomInput
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />

            {/* Password */}

            <CustomInput
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {/* Confirm Password */}

            <CustomInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />

            {/* Register button */}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>

            {/* Login link */}

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Already have an account?{" "}
              <Box
                component="span"
                onClick={() => navigate("/login")}
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Login
              </Box>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
