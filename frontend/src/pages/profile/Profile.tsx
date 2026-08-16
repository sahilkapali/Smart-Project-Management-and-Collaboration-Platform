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
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import toast from "react-hot-toast";

import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
} from "../../services/user.service";
import { useAuth } from "../../context/AuthContext";

import type { User } from "../../types/user.types";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, updateUser } = useAuth() as any;

  const [profile, setProfile] = useState<User | null>(user);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getUserProfile();
        setProfile(profileData);
        setFormData({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          phone: (profileData as any).phone || "",
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB.");
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append("image", file);

      const updatedUser = await uploadProfileImage(data);

      setProfile(updatedUser);
      if (updateUser) {
        updateUser(updatedUser);
      }

      toast.success("Profile image updated successfully!");
    } catch (error: any) {
      console.error("Image upload failed:", error);
      const message =
        error?.response?.data?.message || "Failed to upload image.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updatedUser = await updateUserProfile(formData);
      setProfile(updatedUser);
      if (updateUser) {
        updateUser(updatedUser);
      }
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Profile update failed:", error);
      const message =
        error?.response?.data?.message || "Failed to update profile.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

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
        p: { xs: 2, sm: 3, md: 4 },
        backgroundColor: "background.default",
      }}
    >
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        {/* Navigation & Page Heading */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/dashboard")}
            sx={{
              mb: 1.5,
              color: "text.secondary",
              textTransform: "none",
              "&:hover": { color: "text.primary" },
            }}
          >
            Back to Dashboard
          </Button>

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
              {/* Profile Header Section */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                {/* Avatar Box */}
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Avatar
                    src={profile.profile_image?.path || (profile as any).avatar}
                    alt={fullName}
                    sx={{
                      width: 96,
                      height: 96,
                      fontSize: 34,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      border: "2px solid",
                      borderColor: "divider",
                    }}
                  >
                    {fullName.charAt(0).toUpperCase()}
                  </Avatar>

                  {/* Camera overlay - HIDDEN UNTIL IN EDIT MODE */}
                  {isEditing && (
                    <IconButton
                      component="label"
                      disabled={uploading}
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        bgcolor: "background.paper",
                        color: "text.primary",
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: 2,
                        width: 32,
                        height: 32,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      {uploading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <PhotoCameraRoundedIcon sx={{ fontSize: 18 }} />
                      )}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </IconButton>
                  )}
                </Box>

                <Box sx={{ width: "100%" }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        {fullName}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        {profile.email}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ mt: 0.5, fontWeight: 600 }}
                      >
                        {profile.role}
                      </Typography>
                    </Box>

                    {/* Change Image Button - HIDDEN UNTIL IN EDIT MODE */}
                    {isEditing && (
                      <Button
                        variant="outlined"
                        size="small"
                        component="label"
                        disabled={uploading}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                      >
                        {uploading ? "Uploading..." : "Change Image"}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Stack>

              <Divider />

              {/* Account Information Section */}
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Account Information
                </Typography>

                <Stack spacing={2}>
                  {isEditing ? (
                    <>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        size="small"
                      />
                    </>
                  ) : (
                    <>
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
                    </>
                  )}

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

              {/* Action Buttons */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {isEditing ? (
                  <>
                    <Button
                      variant="contained"
                      onClick={handleSaveProfile}
                      disabled={saving || uploading}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(false)}
                      disabled={saving || uploading}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/profile/change-password")}
                    >
                      Change Password
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Profile;