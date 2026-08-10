import mongoose, { Schema } from "mongoose";
import { IProject, PROJECT_STATUS } from "../types/project.types";

const projectSchema = new Schema<IProject>(
  {
    /**
     * PROJECT NAME
     */
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [3, "Project name must be at least 3 characters long"],
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },

    /**
     * PROJECT DESCRIPTION
     */
    description: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * TEAM THAT OWNS THIS PROJECT
     */
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Team is required"],
    },

    /**
     * USER WHO CREATED THE PROJECT
     */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project creator is required"],
    },

    /**
     * PROJECT STATUS
     */
    status: {
      type: String,
      enum: [
        "PLANNING",
        "ACTIVE",
        "COMPLETED",
        "ARCHIVED",
      ] satisfies PROJECT_STATUS[],
      default: "PLANNING",
    },

    /**
     * PROJECT START DATE
     */
    startDate: {
      type: Date,
    },

    /**
     * PROJECT DUE DATE
     */
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Project = mongoose.model<IProject>("Project", projectSchema);

export default Project;
