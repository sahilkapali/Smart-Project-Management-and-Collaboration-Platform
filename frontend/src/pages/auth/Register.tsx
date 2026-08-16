import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";

import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

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
    // Validation
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

    if (!confirmPassword) {
      toast.error("Please confirm your password.");
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
        email: email.trim().toLowerCase(),
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
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f5f7fb 0%, #eef4ff 50%, #f8f5ff 100%)",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Grid
        container
        sx={{
          width: "100%",
          maxWidth: 1100,
          minHeight: { md: 650 },
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 25px 70px rgba(15, 23, 42, 0.12)",
          backgroundColor: "#ffffff",
        }}
      >
        {/* ============================
            LEFT SIDE
        ============================ */}

        <Grid
          size={{ xs: 12, md: 5 }}
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            p: 6,
            background:
              "linear-gradient(145deg, #2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
            color: "#ffffff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}

          <Box
            sx={{
              position: "absolute",
              width: 280,
              height: 280,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.08)",
              top: -100,
              right: -100,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.06)",
              bottom: -80,
              left: -80,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                lineHeight: 1.15,
              }}
            >
              Smart Project
              <br />
              Management
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.8,
                maxWidth: 390,
                mb: 4,
              }}
            >
              Organize your projects, collaborate with your team, manage tasks
              and track your progress from one powerful platform.
            </Typography>

            <Stack spacing={2.2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleOutlineRoundedIcon />
                <Typography variant="body2">
                  Manage projects efficiently
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleOutlineRoundedIcon />
                <Typography variant="body2">
                  Collaborate with your team
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleOutlineRoundedIcon />
                <Typography variant="body2">
                  Track tasks and project progress
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleOutlineRoundedIcon />
                <Typography variant="body2">
                  Keep everything organized
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>

        {/* ============================
            RIGHT SIDE - REGISTER FORM
        ============================ */}

        <Grid
          size={{ xs: 12, md: 7 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, sm: 5, md: 6 },
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 570,
              backgroundColor: "transparent",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Header */}

              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#111827",
                    mb: 1,
                  }}
                >
                  Create an account
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    fontSize: 15,
                  }}
                >
                  Join Smart Project Management and start managing your projects
                  today.
                </Typography>
              </Box>

              {/* Form */}

              <Stack component="form" spacing={2.2} onSubmit={handleSubmit}>
                {/* Name fields */}

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomInput
                      label="First Name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="John"
                      autoComplete="given-name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineRoundedIcon
                              sx={{ color: "#94a3b8" }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomInput
                      label="Last Name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Doe"
                      autoComplete="family-name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineRoundedIcon
                              sx={{ color: "#94a3b8" }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Email */}

                <CustomInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="john@example.com"
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Phone */}

                <CustomInput
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="98XXXXXXXX"
                  autoComplete="tel"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password */}

                <CustomInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Confirm password */}

                <CustomInput
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password information */}

                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    mt: "-4px !important",
                  }}
                >
                  Password must contain at least 6 characters.
                </Typography>

                {/* Register button */}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: 15,
                    fontWeight: 700,
                    textTransform: "none",
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)",
                    },
                  }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                {/* Divider */}

                <Divider sx={{ my: 1 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    OR
                  </Typography>
                </Divider>

                {/* Login */}

                <Typography
                  variant="body2"
                  textAlign="center"
                  sx={{
                    color: "#64748b",
                  }}
                >
                  Already have an account?{" "}
                  <Box
                    component="span"
                    onClick={() => navigate("/login")}
                    sx={{
                      color: "#2563eb",
                      fontWeight: 700,
                      cursor: "pointer",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Sign in
                  </Box>
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;
