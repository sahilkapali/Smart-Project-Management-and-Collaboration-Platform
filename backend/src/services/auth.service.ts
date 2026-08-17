import User from "../models/user.models";
import AppError from "../utils/AppError.utils";

import { hashPassword, comparePassword } from "../utils/hashPassword.utils";

import { signAccessToken } from "../utils/generateToken.utils";

import { ROLE } from "../types/enum.types";
import { ERROR_CODES } from "../types/error.types";

import {
  RegisterUserInput,
  LoginUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../types/auth.types";

import { generateOTP, hashOTP, compareOTP } from "../utils/otp.utils";

import { sendPasswordResetOTP } from "../utils/mail.utils";

/**
 * Register User
 *
 * IMPORTANT:
 * Public registration ALWAYS creates a TEAM_MEMBER.
 *
 * The client is NOT allowed to choose:
 * ADMIN
 * PROJECT_MANAGER
 * TEAM_MEMBER
 *
 * Role changes must be handled through
 * the protected Admin role-management API.
 */
export const registerUser = async (data: RegisterUserInput) => {
  const { firstName, lastName, email, password, phone } = data;

  const normalizedEmail = email.trim().toLowerCase();

  // -----------------------------------------
  // Check whether user already exists
  // -----------------------------------------

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new AppError("User already exists.", ERROR_CODES.CONFLICT, 409);
  }

  // -----------------------------------------
  // Hash password
  // -----------------------------------------

  const hashedPassword = await hashPassword(password);

  // -----------------------------------------
  // Create user
  // -----------------------------------------
  //
  // SECURITY:
  // Never accept role from public registration.
  //
  // Every newly registered user starts as:
  // TEAM_MEMBER
  //
  // -----------------------------------------

  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone: phone?.trim() || "",
    role: ROLE.TEAM_MEMBER,
  });

  // -----------------------------------------
  // Generate JWT
  // -----------------------------------------

  const token = signAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role as ROLE,
  });

  // -----------------------------------------
  // Remove password from response
  // -----------------------------------------

  const userData = user.toObject();

  delete (userData as any).password;

  return {
    success: true,
    message: "Registration successful.",
    token,
    data: userData,
  };
};

/**
 * Login User
 */
export const loginUser = async (data: LoginUserInput) => {
  const { email, password } = data;

  const normalizedEmail = email.trim().toLowerCase();

  // Find user and explicitly include password
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new AppError(
      "Invalid email or password.",
      ERROR_CODES.UNAUTHORIZED,
      401,
    );
  }

  // Compare password
  const isPasswordMatched = await comparePassword(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(
      "Invalid email or password.",
      ERROR_CODES.UNAUTHORIZED,
      401,
    );
  }

  // Generate JWT
  const token = signAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role as ROLE,
  });

  // Remove password from response
  const userData = user.toObject();

  delete (userData as any).password;

  return {
    success: true,
    message: "Login successful.",
    token,
    data: userData,
  };
};

/**
 * Get User Profile
 */
export const getProfile = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", ERROR_CODES.NOT_FOUND, 404);
  }

  return {
    success: true,
    data: user,
  };
};

/**
 * Update User Profile
 */
export const updateProfile = async (
  userId: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
  }>,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", ERROR_CODES.NOT_FOUND, 404);
  }

  if (data.firstName !== undefined) {
    user.firstName = data.firstName.trim();
  }

  if (data.lastName !== undefined) {
    user.lastName = data.lastName.trim();
  }

  if (data.phone !== undefined) {
    user.phone = data.phone.trim();
  }

  await user.save();

  return {
    success: true,
    message: "Profile updated successfully.",
    data: user,
  };
};

/**
 * Change Password
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError("User not found.", ERROR_CODES.NOT_FOUND, 404);
  }

  // Verify current password
  const isMatched = await comparePassword(currentPassword, user.password);

  if (!isMatched) {
    throw new AppError(
      "Current password is incorrect.",
      ERROR_CODES.UNAUTHORIZED,
      401,
    );
  }

  // Hash new password
  user.password = await hashPassword(newPassword);

  await user.save();

  return {
    success: true,
    message: "Password changed successfully.",
  };
};

/**
 * Forgot Password
 *
 * Generates a 6-digit OTP and sends it
 * to the user's registered email.
 */
export const forgotPassword = async (data: ForgotPasswordInput) => {
  const normalizedEmail = data.email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+otpHash +otpExpiry");

  /*
   * We intentionally return the same response
   * whether the email exists or not.
   *
   * This prevents attackers from discovering
   * which emails are registered.
   */
  if (!user) {
    return {
      success: true,
      message:
        "If an account exists with this email, a password reset OTP has been sent.",
    };
  }

  // Generate 6-digit OTP
  const otp = generateOTP();

  // Hash OTP before storing it
  user.otpHash = hashOTP(otp);

  // OTP expires after 10 minutes
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  // Send OTP through email
  await sendPasswordResetOTP(user.email, otp);

  return {
    success: true,
    message:
      "If an account exists with this email, a password reset OTP has been sent.",
  };
};

/**
 * Reset Password
 */
export const resetPassword = async (data: ResetPasswordInput) => {
  const normalizedEmail = data.email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password +otpHash +otpExpiry");

  if (!user) {
    throw new AppError(
      "Invalid password reset request.",
      ERROR_CODES.BAD_REQUEST,
      400,
    );
  }

  // Check whether OTP exists
  if (!user.otpHash || !user.otpExpiry) {
    throw new AppError(
      "No password reset request found.",
      ERROR_CODES.BAD_REQUEST,
      400,
    );
  }

  // Check OTP expiration
  if (user.otpExpiry.getTime() < Date.now()) {
    user.otpHash = undefined;
    user.otpExpiry = undefined;

    await user.save();

    throw new AppError(
      "OTP has expired. Please request a new OTP.",
      ERROR_CODES.BAD_REQUEST,
      400,
    );
  }

  // Verify OTP
  const isValidOTP = compareOTP(data.otp, user.otpHash);

  if (!isValidOTP) {
    throw new AppError("Invalid OTP.", ERROR_CODES.BAD_REQUEST, 400);
  }

  // Hash new password
  user.password = await hashPassword(data.newPassword);

  // Remove OTP after successful reset
  user.otpHash = undefined;
  user.otpExpiry = undefined;

  await user.save();

  return {
    success: true,
    message:
      "Password reset successful. You can now login with your new password.",
  };
};
