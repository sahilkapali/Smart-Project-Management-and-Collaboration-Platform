import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";

import toast from "react-hot-toast";

import CustomInput from "../../components/CustomInput";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      console.log("Logged-in user:", loggedInUser);

      toast.success("Login successful!");

      navigate("/dashboard", {
        replace: true,
      });
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
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #eef2ff 100%)",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1050,
          minHeight: { md: 590 },
          display: "flex",
          overflow: "hidden",
          borderRadius: 3,
          border: "1px solid rgba(99, 102, 241, 0.12)",
          boxShadow: "0 25px 60px rgba(15, 23, 42, 0.12)",
          backgroundColor: "#ffffff",
        }}
      >
        {/* LEFT BRANDING PANEL */}

        {!isMobile && (
          <Box
            sx={{
              width: "50%",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 5,
              color: "#ffffff",
              background:
                "linear-gradient(145deg, #4338ca 0%, #4f46e5 45%, #6366f1 100%)",
            }}
          >
            {/* Decorative circle */}

            <Box
              sx={{
                position: "absolute",
                width: 280,
                height: 280,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.06)",
                top: -130,
                left: -100,
              }}
            />

            <Box
              sx={{
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.05)",
                bottom: -80,
                right: -70,
              }}
            />

            {/* BRAND */}

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 5,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.16)",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                >
                  <TaskAltRoundedIcon
                    sx={{
                      fontSize: 30,
                      color: "#ffffff",
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 800,
                      lineHeight: 1.1,
                    }}
                  >
                    Smart Project
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 800,
                      lineHeight: 1.1,
                    }}
                  >
                    Management
                  </Typography>
                </Box>
              </Box>

              <Typography
                sx={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.78)",
                  letterSpacing: 0.5,
                }}
              >
                Collaborate • Track • Achieve
              </Typography>
            </Box>

            {/* DASHBOARD ILLUSTRATION */}

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 3,
              }}
            >
              <Box
                sx={{
                  width: "90%",
                  maxWidth: 390,
                  position: "relative",
                }}
              >
                {/* Dashboard window */}

                <Box
                  sx={{
                    width: "100%",
                    height: 220,
                    borderRadius: 3,
                    backgroundColor: "rgba(255,255,255,0.11)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(10px)",
                    p: 2.5,
                    boxShadow: "0 20px 40px rgba(15,23,42,0.18)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.7,
                      mb: 2,
                    }}
                  >
                    {[0.7, 0.5, 0.35].map((opacity, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: `rgba(255,255,255,${opacity})`,
                        }}
                      />
                    ))}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      mb: 1.5,
                    }}
                  >
                    Project Overview
                  </Typography>

                  <Stack spacing={1.2}>
                    <Box
                      sx={{
                        height: 42,
                        borderRadius: 1.5,
                        backgroundColor: "rgba(255,255,255,0.12)",
                        display: "flex",
                        alignItems: "center",
                        px: 1.5,
                        gap: 1.2,
                      }}
                    >
                      <TaskAltRoundedIcon
                        sx={{
                          fontSize: 18,
                          color: "#c7d2fe",
                        }}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            width: "70%",
                            height: 5,
                            borderRadius: 5,
                            backgroundColor: "rgba(255,255,255,0.7)",
                          }}
                        />

                        <Box
                          sx={{
                            width: "45%",
                            height: 4,
                            borderRadius: 5,
                            mt: 0.8,
                            backgroundColor: "rgba(255,255,255,0.25)",
                          }}
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        height: 42,
                        borderRadius: 1.5,
                        backgroundColor: "rgba(255,255,255,0.12)",
                        display: "flex",
                        alignItems: "center",
                        px: 1.5,
                        gap: 1.2,
                      }}
                    >
                      <GroupsRoundedIcon
                        sx={{
                          fontSize: 18,
                          color: "#c7d2fe",
                        }}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            width: "60%",
                            height: 5,
                            borderRadius: 5,
                            backgroundColor: "rgba(255,255,255,0.7)",
                          }}
                        />

                        <Box
                          sx={{
                            width: "35%",
                            height: 4,
                            borderRadius: 5,
                            mt: 0.8,
                            backgroundColor: "rgba(255,255,255,0.25)",
                          }}
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        height: 42,
                        borderRadius: 1.5,
                        backgroundColor: "rgba(255,255,255,0.12)",
                        display: "flex",
                        alignItems: "center",
                        px: 1.5,
                        gap: 1.2,
                      }}
                    >
                      <AnalyticsRoundedIcon
                        sx={{
                          fontSize: 18,
                          color: "#c7d2fe",
                        }}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            width: "80%",
                            height: 5,
                            borderRadius: 5,
                            backgroundColor: "rgba(255,255,255,0.7)",
                          }}
                        />

                        <Box
                          sx={{
                            width: "50%",
                            height: 4,
                            borderRadius: 5,
                            mt: 0.8,
                            backgroundColor: "rgba(255,255,255,0.25)",
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Box>

                {/* Floating task card */}

                <Box
                  sx={{
                    position: "absolute",
                    left: -25,
                    bottom: -18,
                    width: 105,
                    height: 75,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.96)",
                    p: 1.5,
                    color: "#312e81",
                    boxShadow: "0 15px 30px rgba(15,23,42,0.22)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    Tasks
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 800,
                    }}
                  >
                    24
                  </Typography>

                  <Box
                    sx={{
                      height: 4,
                      borderRadius: 4,
                      backgroundColor: "#c7d2fe",
                      mt: 0.5,
                    }}
                  />
                </Box>

                {/* Floating progress card */}

                <Box
                  sx={{
                    position: "absolute",
                    right: -22,
                    top: -18,
                    width: 105,
                    height: 75,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.96)",
                    p: 1.5,
                    color: "#312e81",
                    boxShadow: "0 15px 30px rgba(15,23,42,0.22)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    Progress
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 800,
                    }}
                  >
                    78%
                  </Typography>

                  <Box
                    sx={{
                      height: 4,
                      borderRadius: 4,
                      backgroundColor: "#6366f1",
                      mt: 0.5,
                      width: "78%",
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Typography
              sx={{
                position: "relative",
                zIndex: 1,
                fontSize: 12,
                color: "rgba(255,255,255,0.65)",
                textAlign: "center",
              }}
            >
              Plan smarter. Work better. Deliver faster.
            </Typography>
          </Box>
        )}

        {/* RIGHT LOGIN PANEL */}

        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, sm: 5, md: 6 },
            backgroundColor: "#ffffff",
          }}
        >
          <Stack
            component="form"
            onSubmit={handleSubmit}
            spacing={2.2}
            sx={{
              width: "100%",
              maxWidth: 390,
            }}
          >
            {/* Mobile logo */}

            {isMobile && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #4338ca, #6366f1)",
                    color: "#fff",
                  }}
                >
                  <TaskAltRoundedIcon />
                </Box>
              </Box>
            )}

            {/* Heading */}

            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#111827",
                  fontSize: {
                    xs: 28,
                    sm: 30,
                  },
                }}
              >
                Welcome Back! 👋
              </Typography>

              <Typography
                sx={{
                  mt: 0.8,
                  color: "#6b7280",
                  fontSize: 14,
                }}
              >
                Welcome back! Please sign in to your account.
              </Typography>
            </Box>

            {/* Email */}

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  mb: 0.7,
                }}
              >
                Email address
              </Typography>

              <CustomInput
                label=""
                placeholder="john@example.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                InputProps={{
                  sx: {
                    borderRadius: 1.5,
                    backgroundColor: "#fafafa",
                  },
                }}
              />
            </Box>

            {/* Password */}

            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.7,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Password
                </Typography>

                <Typography
                  component={RouterLink}
                  to="/forgot-password"
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#4f46e5",
                    textDecoration: "none",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot password?
                </Typography>
              </Box>

              <CustomInput
                label=""
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                InputProps={{
                  sx: {
                    borderRadius: 1.5,
                    backgroundColor: "#fafafa",
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        edge="end"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Remember me */}

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  size="small"
                  sx={{
                    color: "#9ca3af",
                    "&.Mui-checked": {
                      color: "#4f46e5",
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  Remember me
                </Typography>
              }
              sx={{
                alignSelf: "flex-start",
                ml: -1,
              }}
            />

            {/* Login button */}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                height: 48,
                borderRadius: 1.5,
                textTransform: "none",
                fontSize: 14,
                fontWeight: 700,
                background: "linear-gradient(135deg, #4338ca, #6366f1)",
                boxShadow: "0 8px 18px rgba(79,70,229,0.25)",
                "&:hover": {
                  background: "linear-gradient(135deg, #3730a3, #4f46e5)",
                  boxShadow: "0 10px 22px rgba(79,70,229,0.32)",
                },
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            {/* Register */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 0.5,
                pt: 0.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                Don't have an account?
              </Typography>

              <Typography
                component={RouterLink}
                to="/register"
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#4f46e5",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Sign Up
              </Typography>
            </Box>

            {/* Security indicator */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 0.6,
                pt: 1,
              }}
            >
              <CheckCircleOutlineRoundedIcon
                sx={{
                  fontSize: 15,
                  color: "#10b981",
                }}
              />

              <Typography
                sx={{
                  fontSize: 11,
                  color: "#9ca3af",
                }}
              >
                Your account information is secure
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;
