import mongoose from "mongoose";
import { ROLE } from "../types/enum.types";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.TEAM_MEMBER,
      required: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: {
        path: { type: String },
        publicId: { type: String },
      },
      required: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otpHash: {
      type: String,
      select: false,
    },

    otpExpiry: {
      type: Date,
      select: false,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
