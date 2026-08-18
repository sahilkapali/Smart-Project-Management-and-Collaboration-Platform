import api from "./api";

import type { User, UserRole, UpdateProfileData } from "../types/user.types";

// ============================================================
// RESPONSE TYPES
// ============================================================

interface UsersResponse {
  success: boolean;
  message?: string;
  data: User[];
}

interface UserResponse {
  success: boolean;
  message?: string;
  data: User;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// ============================================================
// RESPONSE VALIDATION HELPERS
// ============================================================

const ensureUser = (response: UserResponse, fallbackMessage: string): User => {
  if (!response?.data) {
    throw new Error(response?.message || fallbackMessage);
  }

  return response.data;
};

const ensureUsers = (
  response: UsersResponse,
  fallbackMessage: string,
): User[] => {
  if (!Array.isArray(response?.data)) {
    throw new Error(response?.message || fallbackMessage);
  }

  return response.data;
};

// ============================================================
// GET ALL USERS
// ============================================================
//
// Used mainly for:
// - Admin user management
// - Assigning users to teams
// - Assigning issues/tasks
// - Selecting meeting participants
//
// Backend:
// GET /users
//
// ============================================================

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<UsersResponse>("/users");

  return ensureUsers(response.data, "Failed to load users.");
};

// ============================================================
// GET CURRENT USER PROFILE
// ============================================================
//
// Backend:
// GET /users/profile
//
// This endpoint is especially important because AuthContext
// uses it to verify and restore an authenticated session.
//
// ============================================================

export const getUserProfile = async (): Promise<User> => {
  const response = await api.get<UserResponse>("/users/profile");

  return ensureUser(response.data, "Failed to load user profile.");
};

// ============================================================
// UPDATE CURRENT USER PROFILE
// ============================================================
//
// Backend:
// PUT /users/profile
//
// ============================================================

export const updateUserProfile = async (
  data: UpdateProfileData,
): Promise<User> => {
  const response = await api.put<UserResponse>("/users/profile", data);

  return ensureUser(response.data, "Failed to update user profile.");
};

// ============================================================
// UPDATE USER ROLE
// ============================================================
//
// Backend:
// PATCH /users/:userId/role
//
// Important:
// The backend must enforce that only authorized roles
// can change another user's role.
//
// The frontend must NEVER be considered the security layer.
//
// ============================================================

export const updateUserRole = async (
  userId: string,
  role: UserRole,
): Promise<User> => {
  if (!userId) {
    throw new Error("User ID is required to update the user role.");
  }

  if (!role) {
    throw new Error("User role is required.");
  }

  const response = await api.patch<UserResponse>(`/users/${userId}/role`, {
    role,
  });

  return ensureUser(response.data, "Failed to update user role.");
};

// ============================================================
// UPLOAD PROFILE IMAGE
// ============================================================
//
// Backend:
// POST /users/profile/image
//
// FormData is passed directly to Axios.
//
// Do NOT manually set:
// Content-Type: multipart/form-data
//
// Axios/browser will automatically generate the correct
// multipart boundary.
//
// ============================================================

export const uploadProfileImage = async (formData: FormData): Promise<User> => {
  if (!(formData instanceof FormData)) {
    throw new Error("A valid FormData object is required.");
  }

  const response = await api.post<UserResponse>(
    "/users/profile/image",
    formData,
  );

  return ensureUser(response.data, "Failed to upload profile image.");
};

// ============================================================
// CHANGE PASSWORD
// ============================================================
//
// Backend:
// PUT /users/change-password
//
// ============================================================

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const changeUserPassword = async (
  data: ChangePasswordData,
): Promise<ChangePasswordResponse> => {
  if (!data.currentPassword) {
    throw new Error("Current password is required.");
  }

  if (!data.newPassword) {
    throw new Error("New password is required.");
  }

  if (data.currentPassword === data.newPassword) {
    throw new Error(
      "New password must be different from the current password.",
    );
  }

  const response = await api.put<ChangePasswordResponse>(
    "/users/change-password",
    data,
  );

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to change password.");
  }

  return response.data;
};
