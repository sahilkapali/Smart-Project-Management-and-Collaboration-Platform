// ============================================
// User Roles
// ============================================

export type UserRole = "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";

// ============================================
// User
// ============================================

export interface User {
  _id: string;

  firstName: string;
  lastName: string;

  email: string;

  role: UserRole;

  phone?: string;

  profileImage?: {
    path: string;
    publicId: string;
  };

  isVerified?: boolean;

  active?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Login
// ============================================

export interface LoginData {
  email: string;
  password: string;
}

// ============================================
// Registration
// ============================================
//
// IMPORTANT:
// No "role" field here.
//
// New users are automatically created as
// TEAM_MEMBER by the backend.
// ============================================

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// ============================================
// Update Profile
// ============================================

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// ============================================
// Change Password
// ============================================

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// Authentication Response
// ============================================

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  data: User;
}
