export type UserRole = "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  profile_image?: {
    path: string;
    public_id: string;
  };
  isVerified?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  data: User;
}
