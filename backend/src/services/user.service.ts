import User from "../models/user.models";
import { ROLE } from "../types/enum.types";
import { ERROR_CODES } from "../types/error.types";
import AppError from "../utils/AppError.utils";

/**
 * Update another user's role.
 *
 * IMPORTANT:
 * This function must only be called by an
 * Admin-protected controller/route.
 */
export const updateUserRole = async (userId: string, role: ROLE) => {
  // Validate role
  if (!Object.values(ROLE).includes(role)) {
    throw new AppError("Invalid role selected.", ERROR_CODES.BAD_REQUEST, 400);
  }

  // Find user
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", ERROR_CODES.NOT_FOUND, 404);
  }

  // Update role
  user.role = role;

  await user.save();

  // Remove password
  const userData = user.toObject();

  delete (userData as any).password;

  return {
    success: true,
    message: "User role updated successfully.",
    data: userData,
  };
};
