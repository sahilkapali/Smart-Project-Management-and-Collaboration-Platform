import api from "./api";
import type { User } from "../types/user.types";

// ==================== SHARED RESPONSES ====================

interface UserProfileResponse {
  success: boolean;
  message?: string;
  data: User;
}

// ==================== GET PROFILE ====================

export const getUserProfile = async (): Promise<User> => {
  const response = await api.get<UserProfileResponse>("/users/profile");
  return response.data.data;
};

// ==================== UPDATE PROFILE ====================

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone?: string;
}

export const updateUserProfile = async (
  data: UpdateProfileData
): Promise<User> => {
  const response = await api.put<UserProfileResponse>("/users/profile", data);
  return response.data.data;
};

// ==================== UPLOAD PROFILE IMAGE ====================

export const uploadProfileImage = async (
  formData: FormData
): Promise<User> => {
  const response = await api.post<UserProfileResponse>(
    "/users/profile/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
};

// ==================== CHANGE PASSWORD ====================

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const changeUserPassword = async (
  data: ChangePasswordData
): Promise<ChangePasswordResponse> => {
  const response = await api.put<ChangePasswordResponse>(
    "/users/change-password",
    data
  );

  return response.data;
};