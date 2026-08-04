import User from "../models/user.models";

import AppError from "../utils/AppError.utils";

import {
  hashPassword,
  comparePassword,
} from "../utils/hashPassword.utils";

import { signAccessToken } from "../utils/generateToken.utils";

import { ROLE } from "../types/enum.types";
import { ERROR_CODES } from "../types/error.types";

import {
  RegisterUserInput,
  LoginUserInput,
} from "../types/auth.types";

/**
 * Register User
 */
export const registerUser = async (data: RegisterUserInput) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
  } = data;

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new AppError(
      "User already exists.",
      ERROR_CODES.CONFLICT,
      409
    );
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    first_name,
    last_name,
    email: normalizedEmail,
    password: hashedPassword,
    phone,
    role: ROLE.TEAM_MEMBER,
  });

  const token = signAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

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
export const loginUser = async (
  data: LoginUserInput
) => {
  const { email, password } = data;

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new AppError(
      "Invalid email or password.",
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }

  const isPasswordMatched = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordMatched) {
    throw new AppError(
      "Invalid email or password.",
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }

  const token = signAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

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
 * Get Logged-in User Profile
 */
export const getProfile = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found.",
      ERROR_CODES.NOT_FOUND,
      404
    );
  }

  return {
    success: true,
    data: user,
  };
};

/**
 * Update Profile
 */
export const updateProfile = async (
  userId: string,
  data: Partial<RegisterUserInput>
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found.",
      ERROR_CODES.NOT_FOUND,
      404
    );
  }

  if (data.first_name) {
    user.first_name = data.first_name;
  }

  if (data.last_name) {
    user.last_name = data.last_name;
  }

  if (data.phone) {
    user.phone = data.phone;
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
  newPassword: string
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError(
      "User not found.",
      ERROR_CODES.NOT_FOUND,
      404
    );
  }

  const isMatched = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isMatched) {
    throw new AppError(
      "Current password is incorrect.",
      ERROR_CODES.UNAUTHORIZED,
      401
    );
  }

  user.password = await hashPassword(newPassword);

  await user.save();

  return {
    success: true,
    message: "Password changed successfully.",
  };
};