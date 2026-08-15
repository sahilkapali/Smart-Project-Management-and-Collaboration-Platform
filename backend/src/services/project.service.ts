import mongoose from "mongoose";

import Project from "../models/project.models";
import Team from "../models/team.models";

import { PROJECT_STATUS } from "../types/project.types";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

/**
 * User roles used by project authorization.
 *
 * Existing project authorization:
 * - ADMIN: can manage any project
 * - PROJECT_MANAGER: can manage projects in their own team
 * - TEAM_MEMBER: cannot create/update/delete projects
 */
export type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "TEAM_MEMBER"
  | string;

/**
 * Data accepted when updating a project.
 */
export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: PROJECT_STATUS;
  startDate?: Date;
  dueDate?: Date;
}

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

/**
 * Validate MongoDB ObjectId.
 */
const validateObjectId = (
  id: string,
  fieldName: string,
): void => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName}.`);
  }
};

/**
 * Convert string to ObjectId.
 */
const toObjectId = (id: string): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

/**
 * Check whether user is ADMIN.
 */
const isAdmin = (userRole: UserRole): boolean => {
  return userRole === "ADMIN";
};

/**
 * Check whether user is PROJECT_MANAGER.
 */
const isProjectManager = (userRole: UserRole): boolean => {
  return userRole === "PROJECT_MANAGER";
};

/**
 * =========================================================
 * CREATE PROJECT
 * =========================================================
 */
export const createProject = async (
  name: string,
  description: string | undefined,
  teamId: string,
  userId: string,
  userRole: UserRole,
  status: PROJECT_STATUS = PROJECT_STATUS.PLANNING,
  startDate?: Date,
  dueDate?: Date,
) => {
  /**
   * Validate IDs.
   */
  validateObjectId(teamId, "team ID");
  validateObjectId(userId, "user ID");

  /**
   * Only ADMIN and PROJECT_MANAGER can create projects.
   */
  if (!isAdmin(userRole) && !isProjectManager(userRole)) {
    throw new Error(
      "You are not authorized to create a project.",
    );
  }

  /**
   * Find the team.
   */
  const team = await Team.findById(teamId);

  if (!team) {
    throw new Error("Team not found.");
  }

  /**
   * PROJECT_MANAGER must belong to the team.
   *
   * ADMIN can create projects for any team.
   */
  if (!isAdmin(userRole)) {
    const isMember = team.members.some(
      (member: any) =>
        member.toString() === userId,
    );

    if (!isMember) {
      throw new Error(
        "You must be a member of the team to create a project.",
      );
    }
  }

  /**
   * Validate dates.
   */
  if (
    startDate &&
    dueDate &&
    dueDate < startDate
  ) {
    throw new Error(
      "Due date cannot be earlier than start date.",
    );
  }

  /**
   * Create project.
   */
  const project = await Project.create({
    name,
    description,
    team: toObjectId(teamId),
    createdBy: toObjectId(userId),
    members: [toObjectId(userId)],
    status,
    startDate,
    dueDate,
  });

  /**
   * Return populated project.
   */
  return await Project.findById(project._id)
    .populate("team")
    .populate("createdBy", "name email role")
    .populate("members", "name email role");
};

/**
 * =========================================================
 * GET USER PROJECTS
 * =========================================================
 */
export const getUserProjects = async (
  userId: string,
  userRole: UserRole,
) => {
  validateObjectId(userId, "user ID");

  const userObjectId = toObjectId(userId);

  /**
   * ADMIN can see all projects.
   */
  if (isAdmin(userRole)) {
    return await Project.find()
      .populate("team")
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });
  }

  /**
   * Other users can see projects where they
   * are a member.
   */
  return await Project.find({
    members: userObjectId,
  })
    .populate("team")
    .populate("createdBy", "name email role")
    .populate("members", "name email role")
    .sort({ createdAt: -1 });
};

/**
 * =========================================================
 * GET PROJECT BY ID
 * =========================================================
 */
export const getProjectById = async (
  projectId: string,
  userId: string,
  userRole: UserRole,
) => {
  validateObjectId(projectId, "project ID");
  validateObjectId(userId, "user ID");

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  /**
   * ADMIN can access any project.
   */
  if (!isAdmin(userRole)) {
    const isMember = project.members.some(
      (member: any) =>
        member.toString() === userId,
    );

    if (!isMember) {
      throw new Error(
        "You are not a member of this project.",
      );
    }
  }

  /**
   * Return populated project.
   */
  return await Project.findById(projectId)
    .populate("team")
    .populate("createdBy", "name email role")
    .populate("members", "name email role");
};

/**
 * =========================================================
 * UPDATE PROJECT
 * =========================================================
 */
export const updateProject = async (
  projectId: string,
  userId: string,
  userRole: UserRole,
  data: UpdateProjectData,
) => {
  validateObjectId(projectId, "project ID");
  validateObjectId(userId, "user ID");

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  /**
   * ADMIN can update any project.
   */
  if (isAdmin(userRole)) {
    // Allowed.
  } else if (isProjectManager(userRole)) {
    /**
     * PROJECT_MANAGER must belong to project's team.
     */
    const team = await Team.findOne({
      _id: project.team,
      members: toObjectId(userId),
    });

    if (!team) {
      throw new Error(
        "You are not authorized to update this project.",
      );
    }
  } else {
    /**
     * TEAM_MEMBER cannot update project.
     */
    throw new Error(
      "You are not authorized to update this project.",
    );
  }

  /**
   * Validate update dates against existing dates.
   */
  const finalStartDate =
    data.startDate !== undefined
      ? data.startDate
      : project.startDate;

  const finalDueDate =
    data.dueDate !== undefined
      ? data.dueDate
      : project.dueDate;

  if (
    finalStartDate &&
    finalDueDate &&
    finalDueDate < finalStartDate
  ) {
    throw new Error(
      "Due date cannot be earlier than start date.",
    );
  }

  /**
   * Only update supplied fields.
   */
  if (data.name !== undefined) {
    project.name = data.name;
  }

  if (data.description !== undefined) {
    project.description = data.description;
  }

  if (data.status !== undefined) {
    project.status = data.status;
  }

  if (data.startDate !== undefined) {
    project.startDate = data.startDate;
  }

  if (data.dueDate !== undefined) {
    project.dueDate = data.dueDate;
  }

  await project.save();

  /**
   * Return populated updated project.
   */
  return await Project.findById(project._id)
    .populate("team")
    .populate("createdBy", "name email role")
    .populate("members", "name email role");
};

/**
 * =========================================================
 * DELETE PROJECT
 * =========================================================
 */
export const deleteProject = async (
  projectId: string,
  userId: string,
  userRole: UserRole,
): Promise<boolean> => {
  validateObjectId(projectId, "project ID");
  validateObjectId(userId, "user ID");

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  /**
   * ADMIN can delete any project.
   */
  if (isAdmin(userRole)) {
    await Project.findByIdAndDelete(projectId);
    return true;
  }

  /**
   * PROJECT_MANAGER must belong to project's team.
   */
  if (isProjectManager(userRole)) {
    const team = await Team.findOne({
      _id: project.team,
      members: toObjectId(userId),
    });

    if (!team) {
      throw new Error(
        "You are not authorized to delete this project.",
      );
    }

    await Project.findByIdAndDelete(projectId);

    return true;
  }

  /**
   * TEAM_MEMBER and other roles cannot delete.
   */
  throw new Error(
    "You are not authorized to delete this project.",
  );
};