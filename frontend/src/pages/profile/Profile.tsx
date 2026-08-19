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
  uploadProfileImage,
} from "../../services/user.service";

import { useAuth } from "../../context/AuthContext";

import type { User, UpdateProfileData } from "../../types/user.types";

const Profile = () => {
  const navigate = useNavigate();

  // ==========================================================
  // AUTH CONTEXT
  // ==========================================================

  const { user, loading: authLoading, updateUserProfile } = useAuth();

  // ==========================================================
  // LOCAL STATE
  // ==========================================================

  const [profile, setProfile] = useState<User | null>(user);

  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const profileData = await getUserProfile();

        setProfile(profileData);

        setFormData({
          firstName: profileData.firstName || "",

          lastName: profileData.lastName || "",

          phone: profileData.phone || "",
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
      void loadProfile();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // IMAGE CHANGE
  // ==========================================================

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // --------------------------------------------------------
    // Validate file size
    // --------------------------------------------------------

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB.");

      event.target.value = "";

      return;
    }

    // --------------------------------------------------------
    // Validate image type
    // --------------------------------------------------------

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");

      event.target.value = "";

      return;
    }

    try {
      setUploading(true);

      const data = new FormData();

      data.append("image", file);

      const updatedUser = await uploadProfileImage(data);

      // ------------------------------------------------------
      // Update local profile state
      // ------------------------------------------------------

      setProfile(updatedUser);

      // ------------------------------------------------------
      // Update AuthContext
      // ------------------------------------------------------
      //
      // This is important.
      //
      // AuthContext now updates:
      //
      // - React user state
      // - localStorage user
      //
      // ------------------------------------------------------

      await updateUserProfile({
        firstName: updatedUser.firstName,

        lastName: updatedUser.lastName,

        phone: updatedUser.phone || "",
      });

      toast.success("Profile image updated successfully!");
    } catch (error: any) {
      console.error("Image upload failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload image.";

      toast.error(message);
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  };

  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSaveProfile = async () => {
    // --------------------------------------------------------
    // Basic validation
    // --------------------------------------------------------

    const firstName = formData.firstName?.trim() || "";

    const lastName = formData.lastName?.trim() || "";

    const phone = formData.phone?.trim() || "";

    if (!firstName) {
      toast.error("First name is required.");

      return;
    }

    if (!lastName) {
      toast.error("Last name is required.");

      return;
    }

    try {
      setSaving(true);

      // ------------------------------------------------------
      // Send update to backend through AuthContext
      // ------------------------------------------------------

      const updatedUser = await updateUserProfile({
        firstName,
        lastName,
        phone,
      });

      // ------------------------------------------------------
      // Update local profile
      // ------------------------------------------------------

      setProfile(updatedUser);

      // ------------------------------------------------------
      // Update form
      // ------------------------------------------------------

      setFormData({
        firstName: updatedUser.firstName || "",

        lastName: updatedUser.lastName || "",

        phone: updatedUser.phone || "",
      });

      toast.success("Profile updated successfully!");

      setIsEditing(false);
    } catch (error: any) {
      console.error("Profile update failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update profile.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CANCEL EDIT
  // ==========================================================

  const handleCancelEdit = () => {
    if (!profile) {
      return;
    }

    setFormData({
      firstName: profile.firstName || "",

      lastName: profile.lastName || "",

      phone: profile.phone || "",
    });

    setIsEditing(false);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

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

  // ==========================================================
  // NO PROFILE
  // ==========================================================

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

  // ==========================================================
  // FULL NAME
  // ==========================================================

  const fullName =
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User";

  // ==========================================================
  // AVATAR LETTER
  // ==========================================================

  const avatarLetter = profile.firstName?.charAt(0)?.toUpperCase() || "U";

  // ==========================================================
  // RENDER
  // ==========================================================

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
        {/* ==================================================
            HEADER
           ================================================== */}

        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/dashboard")}
            sx={{
              mb: 1.5,
              color: "text.secondary",
              textTransform: "none",
              "&:hover": {
                color: "text.primary",
              },
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

        {/* ==================================================
            PROFILE CARD
           ================================================== */}

        <Card>
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 3,
                md: 4,
              },
            }}
          >
            <Stack spacing={3}>
              {/* ============================================
                  PROFILE HEADER
                 ============================================ */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={3}
                alignItems={{
                  xs: "flex-start",
                  sm: "center",
                }}
              >
                {/* AVATAR */}

                <Box
                  sx={{
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  <Avatar
                    src={profile.profileImage?.path || (profile as any).avatar}
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
                    {avatarLetter}
                  </Avatar>

                  {/* CAMERA BUTTON */}

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
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      {uploading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <PhotoCameraRoundedIcon
                          sx={{
                            fontSize: 18,
                          }}
                        />
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

                {/* USER INFORMATION */}

                <Box
                  sx={{
                    width: "100%",
                  }}
                >
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={1.5}
                    alignItems={{
                      xs: "flex-start",
                      sm: "center",
                    }}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        {fullName}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                        }}
                      >
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

                    {/* CHANGE IMAGE */}

                    {isEditing && (
                      <Button
                        variant="outlined"
                        size="small"
                        component="label"
                        disabled={uploading}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                        }}
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

              {/* ==================================================
                  ACCOUNT INFORMATION
                 ================================================== */}

              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Account Information
                </Typography>

                <Stack spacing={2}>
                  {/* FIRST NAME */}

                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      size="small"
                    />
                  ) : (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        First Name
                      </Typography>

                      <Typography>
                        {profile.firstName || "Not provided"}
                      </Typography>
                    </Box>
                  )}

                  {/* LAST NAME */}

                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      size="small"
                    />
                  ) : (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Last Name
                      </Typography>

                      <Typography>
                        {profile.lastName || "Not provided"}
                      </Typography>
                    </Box>
                  )}

                  {/* PHONE */}

                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      size="small"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>

                      <Typography>{profile.phone || "Not provided"}</Typography>
                    </Box>
                  )}

                  {/* EMAIL */}

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>

                    <Typography>{profile.email}</Typography>
                  </Box>

                  {/* ROLE */}

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Role
                    </Typography>

                    <Typography>{profile.role}</Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* ==================================================
                  ACTION BUTTONS
                 ================================================== */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
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
                      onClick={handleCancelEdit}
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
