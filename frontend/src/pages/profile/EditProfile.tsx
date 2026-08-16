import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import toast from "react-hot-toast";

import CustomInput from "../../components/CustomInput";

import { getUserProfile, updateUserProfile } from "../../services/user.service";

import { useAuth } from "../../context/AuthContext";

const EditProfile = () => {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // Load current profile
  // ==========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const profile = await getUserProfile();

        setFirstName(profile.firstName || "");
        setLastName(profile.lastName || "");
        setPhone("");
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

  // ==========================================
  // Save profile
  // ==========================================

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!firstName.trim()) {
      toast.error("First name is required.");
      return;
    }

    if (!lastName.trim()) {
      toast.error("Last name is required.");
      return;
    }

    try {
      setSaving(true);

      const updatedUser = await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });

      /*
       * Update the locally stored user so the UI can
       * reflect the new profile information.
       */
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully.");

      navigate("/profile");
    } catch (error: any) {
      console.error("Profile update error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update your profile.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Loading
  // ==========================================

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

  // ==========================================
  // Not authenticated
  // ==========================================

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">
          Please log in to edit your profile.
        </Typography>

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
          maxWidth: 600,
          mx: "auto",
        }}
      >
        {/* Heading */}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Edit Profile
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Update your personal information.
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
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

              {/* Email - read only */}

              <CustomInput
                label="Email Address"
                type="email"
                value={user.email}
                onChange={() => {}}
                disabled
              />

              {/* Phone */}

              <CustomInput
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />

              {/* Role - read only */}

              <CustomInput
                label="Role"
                value={user.role}
                onChange={() => {}}
                disabled
              />

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
                  disabled={saving}
                  fullWidth
                >
                  {saving ? "Saving..." : "Save Changes"}
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

export default EditProfile;
