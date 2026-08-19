import { UploadApiResponse } from "cloudinary";

import cloudinary from "../config/cloudinary";
import User from "../models/user.models";
import AppError from "../utils/AppError.utils";
import { ERROR_CODES } from "../types/error.types";

// ============================================================
// TYPES
// ============================================================

interface ProfileImageUploadResult {
  path: string;
  publicId: string;
}

// ============================================================
// UPLOAD BUFFER TO CLOUDINARY
// ============================================================
//
// Multer memoryStorage gives us a Buffer.
// Cloudinary's upload_stream accepts that buffer through a
// writable stream.
//
// ============================================================

const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary did not return an upload result."));
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

// ============================================================
// UPDATE USER PROFILE IMAGE
// ============================================================

export const updateProfileImage = async (
  userId: string,
  file: Express.Multer.File,
): Promise<ProfileImageUploadResult> => {
  // ----------------------------------------------------------
  // Validate file
  // ----------------------------------------------------------

  if (!file) {
    throw new AppError(
      "Profile image is required.",
      ERROR_CODES.BAD_REQUEST,
      400,
    );
  }

  if (!file.buffer) {
    throw new AppError(
      "Uploaded image could not be read.",
      ERROR_CODES.BAD_REQUEST,
      400,
    );
  }

  // ----------------------------------------------------------
  // Find user
  // ----------------------------------------------------------

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found.", ERROR_CODES.NOT_FOUND, 404);
  }

  // ----------------------------------------------------------
  // Delete previous Cloudinary image
  // ----------------------------------------------------------
  //
  // If the user already has a profile image, remove it first.
  //
  // We intentionally ignore deletion failure so that an old
  // image does not prevent a new profile image from being saved.
  //
  // ----------------------------------------------------------

  if (user.profileImage?.publicId) {
    try {
      await cloudinary.uploader.destroy(user.profileImage.publicId, {
        resource_type: "image",
      });
    } catch (error) {
      console.error(
        "Failed to delete previous profile image from Cloudinary:",
        error,
      );
    }
  }

  // ----------------------------------------------------------
  // Upload new image
  // ----------------------------------------------------------

  let uploadedImage: UploadApiResponse;

  try {
    uploadedImage = await uploadBufferToCloudinary(
      file.buffer,
      "smart-project-management/profile-images",
    );
  } catch (error) {
    console.error("Failed to upload profile image to Cloudinary:", error);

    throw new AppError(
      "Failed to upload profile image.",
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      500,
    );
  }

  // ----------------------------------------------------------
  // Save image information in MongoDB
  // ----------------------------------------------------------

  user.profileImage = {
    path: uploadedImage.secure_url,
    publicId: uploadedImage.public_id,
  };

  await user.save();

  // ----------------------------------------------------------
  // Return image information
  // ----------------------------------------------------------

  return {
    path: uploadedImage.secure_url,
    publicId: uploadedImage.public_id,
  };
};
