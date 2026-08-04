import mongoose from "mongoose";
import { ROLE } from "../types/enum.types";

const user_schema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    last_name: {
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
    },

    phone: {
      type: String,
      default: "",
    },

    profile_image: {
      type: {
        path: {
          type: String,
        },

        public_id: {
          type: String,
        },
      },
      required: false,
    },

    is_verified: {
      type: Boolean,
      default: false,
    },

    otp_hash: {
      type: String,
      select: false,
    },

    otp_expiry: {
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
  }
);

const User = mongoose.model("User", user_schema);

export default User;