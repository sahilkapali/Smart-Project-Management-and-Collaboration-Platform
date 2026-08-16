import api from "./api";

import type {
  AuthResponse,
  LoginData,
  RegisterData,
} from "../types/user.types";

// ==================== LOGIN ====================

export const loginUser = async (
  data: LoginData
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    data
  );

  return response.data;
};

// ==================== REGISTER ====================

export const registerUser = async (
  data: RegisterData
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/register",
    data
  );

  return response.data;
};

// ==================== FORGOT PASSWORD ====================

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export const forgotPassword = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  const response = await api.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    {
      email,
    }
  );

  return response.data;
};

// ==================== RESET PASSWORD ====================

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export const resetPassword = async (
  data: ResetPasswordData
): Promise<ResetPasswordResponse> => {
  const response = await api.post<ResetPasswordResponse>(
    "/auth/reset-password",
    data
  );

  return response.data;
};