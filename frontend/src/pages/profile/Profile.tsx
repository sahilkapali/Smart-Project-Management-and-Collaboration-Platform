import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import toast from "react-hot-toast";

import { getUserProfile } from "../../services/user.service";
import { useAuth } from "../../context/AuthContext";

import type { User } from "../../types/user.types";

const Profile = () => {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<User | null>(user);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const profileData = await getUserProfile();

        setProfile(profileData);
      } catch (error: any) {
        console.error("Failed to load profile:", error);

        const message =
          error?.response?.data?.message || "Unable to load your profile.";

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadProfile();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">Profile not available</Typography>

        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  const fullName =
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User";

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
          maxWidth: 900,
          mx: "auto",
        }}
      >
        {/* Page heading */}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            My Profile
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            View and manage your account information.
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              {/* Profile header */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
                alignItems={{
                  xs: "flex-start",
                  sm: "center",
                }}
              >
                <Avatar
                  src={profile.profile_image?.path}
                  alt={fullName}
                  sx={{
                    width: 90,
                    height: 90,
                    fontSize: 32,
                  }}
                >
                  {fullName.charAt(0).toUpperCase()}
                </Avatar>

                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {fullName}
                  </Typography>

                  <Typography color="text.secondary">
                    {profile.email}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{
                      mt: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    {profile.role}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              {/* Account information */}

              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Account Information
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      First Name
                    </Typography>

                    <Typography>
                      {profile.firstName || "Not provided"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Last Name
                    </Typography>

                    <Typography>
                      {profile.lastName || "Not provided"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>

                    <Typography>{profile.email}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Role
                    </Typography>

                    <Typography>{profile.role}</Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Actions */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate("/profile/edit")}
                >
                  Edit Profile
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/profile/change-password")}
                >
                  Change Password
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Profile;
