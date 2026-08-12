import { ROLE } from "./enum.types";

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?:ROLE
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}