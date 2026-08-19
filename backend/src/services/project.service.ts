import mongoose from "mongoose";

import Project from "../models/project.models";
import Team from "../models/team.models";
import User from "../models/user.models";

import { PROJECT_STATUS } from "../types/project.types";
import { ROLE } from "../types/enum.types";
import AppError from "../utils/AppError.utils";
import { ERROR_CODES } from "../types/error.types";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export type UserRole = "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER" | string;

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
const validateObjectId = (id: string, fieldName: string): void => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(
      `Invalid ${fieldName}.`,
      ERROR_CODES.VALIDATION_ERROR,
      400,
    );
  }
};

/**
 * Convert string to MongoDB ObjectId.
 */
const toObjectId = (id: string): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

/**
 * =========================================================
 * ADD TEAM NAME TO PROJECT RESPONSE
 * =========================================================
 *
 * Database continues to store:
 *
 * team: ObjectId
 *
 * API response additionally contains:
 *
 * teamName: string
 *
 * This allows the frontend to display:
 *
 * Team: Development Team
 *
 * instead of:
 *
 * Team: 6a847b3dd654acf198152185
 *
 * =========================================================
 */

const addTeamNameToProject = (project: any) => {
  if (!project) {
    return project;
  }

  /**
   * Convert Mongoose document into
   * a normal JavaScript object.
   */
  const projectObject =
    typeof project.toObject === "function" ? project.toObject() : project;

  /**
   * The team should already be populated
   * by the query.
   */
  const populatedTeam = projectObject.team;

  let teamName = "No team assigned";

  /**
   * If team is populated:
   *
   * team = {
   *   _id: "...",
   *   name: "Development Team",
   *   ...
   * }
   */
  if (
    populatedTeam &&
    typeof populatedTeam === "object" &&
    typeof populatedTeam.name === "string"
  ) {
    teamName = populatedTeam.name.trim() || "Unnamed Team";
  }

  return {
    ...projectObject,
    teamName,
  };
};

/**
 * =========================================================
 * PROJECT ACCESS CHECK
 * =========================================================
 *
 * A user can access a project ONLY if:
 *
 * 1. They created the project
 *
 * OR
 *
 * 2. They are the owner of the project's team
 *
 * OR
 *
 * 3. They are a member of the project's team
 *
 * Being ADMIN alone does NOT automatically grant
 * access to every project.
 *
 * =========================================================
 */

export const canAccessProject = async (
  projectId: string,
  userId: string,
): Promise<boolean> => {
  validateObjectId(projectId, "project ID");

  validateObjectId(userId, "user ID");

  const userObjectId = toObjectId(userId);

  /**
   * Find project.
   */
  const project = await Project.findById(projectId).select("createdBy team");

  if (!project) {
    return false;
  }

  /**
   * Project creator.
   */
  if (project.createdBy.toString() === userId) {
    return true;
  }

  /**
   * Find project's team.
   */
  const team = await Team.findById(project.team).select("owner members");

  if (!team) {
    return false;
  }

  /**
   * Team owner / project manager.
   */
  if (team.owner.toString() === userId) {
    return true;
  }

  /**
   * Team member.
   */
  const isTeamMember = team.members.some(
    (member) => member.toString() === userObjectId.toString(),
  );

  return isTeamMember;
};

/**
 * =========================================================
 * REQUIRE PROJECT ACCESS
 * =========================================================
 */

export const requireProjectAccess = async (
  projectId: string,
  userId: string,
): Promise<void> => {
  const allowed = await canAccessProject(projectId, userId);

  if (!allowed) {
    throw new AppError(
      "You do not have access to this project. You must be the project creator, the project manager, or a member of the project's team.",
      ERROR_CODES.FORBIDDEN,
      403,
    );
  }
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
   * Only ADMIN and PROJECT_MANAGER
   * can create projects.
   */
  if (userRole !== ROLE.ADMIN && userRole !== ROLE.PROJECT_MANAGER) {
    throw new AppError(
      "You are not authorized to create a project.",
      ERROR_CODES.FORBIDDEN,
      403,
    );
  }

  /**
   * Find team.
   */
  const team = await Team.findById(teamId);

  if (!team) {
    throw new AppError("Team not found.", ERROR_CODES.NOT_FOUND, 404);
  }

  /**
   * Project manager must belong
   * to the team.
   */
  if (userRole === ROLE.PROJECT_MANAGER) {
    const isTeamMember = team.members.some(
      (member) => member.toString() === userId,
    );

    if (!isTeamMember) {
      throw new AppError(
        "You must be a member of the team to create a project.",
        ERROR_CODES.FORBIDDEN,
        403,
      );
    }
  }

  /**
   * Validate dates.
   */
  if (startDate && dueDate && dueDate < startDate) {
    throw new AppError(
      "Due date cannot be earlier than start date.",
      ERROR_CODES.VALIDATION_ERROR,
      400,
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
   * Populate team with name.
   */
  const populatedProject = await Project.findById(project._id)
    .populate("team", "name owner members")
    .populate("createdBy", "firstName lastName email role")
    .populate("members", "firstName lastName email role");

  return addTeamNameToProject(populatedProject);
};

/**
 * =========================================================
 * ADD PROJECT MEMBER
 * =========================================================
 *
 * Only the owner of the project's team
 * can add a project member.
 *
 * The user being added must already
 * belong to the project's team.
 *
 * =========================================================
 */

export const addProjectMember = async (
  projectId: string,
  email: string,
  requesterId: string,
  _requesterRole: UserRole,
) => {
  /**
   * Validate IDs.
   */
  validateObjectId(projectId, "project ID");

  validateObjectId(requesterId, "user ID");

  /**
   * Normalize email.
   */
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new AppError("Email is required.", ERROR_CODES.VALIDATION_ERROR, 400);
  }

  /**
   * Find project.
   */
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError("Project not found.", ERROR_CODES.NOT_FOUND, 404);
  }

  /**
   * Find project's team.
   */
  const team = await Team.findById(project.team).select("owner members");

  if (!team) {
    throw new AppError("Project team not found.", ERROR_CODES.NOT_FOUND, 404);
  }

  /**
   * Only team owner /
   * project manager can add members.
   */
  if (team.owner.toString() !== requesterId) {
    throw new AppError(
      "Only the project manager can add members to this project.",
      ERROR_CODES.FORBIDDEN,
      403,
    );
  }

  /**
   * Find user by email.
   */
  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new AppError(
      "No user was found with this email address.",
      ERROR_CODES.NOT_FOUND,
      404,
    );
  }

  /**
   * Check team membership.
   */
  const isTeamMember = team.members.some(
    (memberId) => memberId.toString() === user._id.toString(),
  );

  if (!isTeamMember) {
    throw new AppError(
      "This user is not a member of the project's team.",
      ERROR_CODES.FORBIDDEN,
      403,
    );
  }

  /**
   * Check existing project membership.
   */
  const isProjectMember = project.members.some(
    (memberId) => memberId.toString() === user._id.toString(),
  );

  if (isProjectMember) {
    throw new AppError(
      "User is already a member of this project.",
      ERROR_CODES.CONFLICT,
      409,
    );
  }

  /**
   * Add member.
   */
  project.members.push(user._id);

  await project.save();

  /**
   * Return populated project.
   */
  const populatedProject = await Project.findById(project._id)
    .populate("team", "name owner members")
    .populate("createdBy", "firstName lastName email role")
    .populate("members", "firstName lastName email role");

  return addTeamNameToProject(populatedProject);
};

/**
 * =========================================================
 * GET USER PROJECTS
 * =========================================================
 *
 * Returns projects where:
 *
 * 1. User created the project
 *
 * OR
 *
 * 2. User owns the project team
 *
 * OR
 *
 * 3. User belongs to the project team
 *
 * OR
 *
 * 4. User is already a project member
 *
 * =========================================================
 */

export const getUserProjects = async (userId: string, _userRole: UserRole) => {
  validateObjectId(userId, "user ID");

  const userObjectId = toObjectId(userId);

  /**
   * Find teams where user
   * is a member.
   */
  const teams = await Team.find({
    members: userObjectId,
  }).select("_id");

  const teamIds = teams.map((team) => team._id);

  /**
   * Find teams owned by user.
   */
  const ownedTeams = await Team.find({
    owner: userObjectId,
  }).select("_id");

  const ownedTeamIds = ownedTeams.map((team) => team._id);

  /**
   * Combine team IDs.
   */
  const allTeamIds = [...teamIds, ...ownedTeamIds];

  /**
   * Find projects.
   */
  const projects = await Project.find({
    $or: [
      {
        createdBy: userObjectId,
      },
      {
        team: {
          $in: allTeamIds,
        },
      },
      {
        members: userObjectId,
      },
    ],
  })
    .populate("team", "name owner members")
    .populate("createdBy", "firstName lastName email role")
    .populate("members", "firstName lastName email role")
    .sort({
      createdAt: -1,
    });

  /**
   * Add teamName to every project.
   */
  return projects.map((project) => addTeamNameToProject(project));
};

/**
 * =========================================================
 * GET PROJECT BY ID
 * =========================================================
 */

export const getProjectById = async (
  projectId: string,
  userId: string,
  _userRole: UserRole,
) => {
  validateObjectId(projectId, "project ID");

  validateObjectId(userId, "user ID");

  /**
   * Check whether project exists.
   */
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError("Project not found.", ERROR_CODES.NOT_FOUND, 404);
  }

  /**
   * Check access.
   */
  await requireProjectAccess(projectId, userId);

  /**
   * Get populated project.
   */
  const populatedProject = await Project.findById(projectId)
    .populate("team", "name owner members")
    .populate("createdBy", "firstName lastName email role")
    .populate("members", "firstName lastName email role");

  return addTeamNameToProject(populatedProject);
};

/**
 * =========================================================
 * UPDATE PROJECT
 * =========================================================
 *
 * Only:
 *
 * - Project creator
 * - Team owner / project manager
 *
 * can update the project.
 *
 * =========================================================
 */

export const updateProject = async (
  projectId: string,
  userId: string,
  _userRole: UserRole,
  data: UpdateProjectData,
) => {
  validateObjectId(projectId, "project ID");

  validateObjectId(userId, "user ID");

  /**
   * Find project.
   */
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError("Project not found.", ERROR_CODES.NOT_FOUND, 404);
  }

  /**
   * Project creator can update.
   */
  if (project.createdBy.toString() !== userId) {
    /**
     * Otherwise team owner /
     * project manager can update.
     */
    const team = await Team.findById(project.team).select("owner");

    if (!team || team.owner.toString() !== userId) {
      throw new AppError(
        "Only the project creator or project manager can update this project.",
        ERROR_CODES.FORBIDDEN,
        403,
      );
    }
  }

  /**
   * Calculate final dates.
   */
  const finalStartDate =
    data.startDate !== undefined ? data.startDate : project.startDate;

  const finalDueDate =
    data.dueDate !== undefined ? data.dueDate : project.dueDate;

  /**
   * Validate final dates.
   */
  if (finalStartDate && finalDueDate && finalDueDate < finalStartDate) {
    throw new AppError(
      "Due date cannot be earlier than start date.",
      ERROR_CODES.VALIDATION_ERROR,
      400,
    );
  }

  /**
   * Update name.
   */
  if (data.name !== undefined) {
    project.name = data.name;
  }

  /**
   * Update description.
   */
  if (data.description !== undefined) {
    project.description = data.description;
  }

  /**
   * Update status.
   */
  if (data.status !== undefined) {
    project.status = data.status;
  }

  /**
   * Update start date.
   */
  if (data.startDate !== undefined) {
    project.startDate = data.startDate;
  }

  /**
   * Update due date.
   */
  if (data.dueDate !== undefined) {
    project.dueDate = data.dueDate;
  }

  /**
   * Save changes.
   */
  await project.save();

  /**
   * Return populated project
   * with team name.
   */
  const populatedProject = await Project.findById(project._id)
    .populate("team", "name owner members")
    .populate("createdBy", "firstName lastName email role")
    .populate("members", "firstName lastName email role");

  return addTeamNameToProject(populatedProject);
};

/**
 * =========================================================
 * DELETE PROJECT
 * =========================================================
 *
 * Only:
 *
 * - Project creator
 * - Team owner / project manager
 *
 * can delete.
 *
 * =========================================================
 */

export const deleteProject = async (
  projectId: string,
  userId: string,
  _userRole: UserRole,
): Promise<boolean> => {
  validateObjectId(projectId, "project ID");

  validateObjectId(userId, "user ID");

  /**
   * Find project.
   */
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError("Project not found.", ERROR_CODES.NOT_FOUND, 404);
  }

  /**
   * Project creator can delete.
   */
  if (project.createdBy.toString() === userId) {
    await Project.findByIdAndDelete(projectId);

    return true;
  }

  /**
   * Otherwise only team owner /
   * project manager can delete.
   */
  const team = await Team.findById(project.team).select("owner");

  if (!team || team.owner.toString() !== userId) {
    throw new AppError(
      "Only the project creator or project manager can delete this project.",
      ERROR_CODES.FORBIDDEN,
      403,
    );
  }

  /**
   * Delete project.
   */
  await Project.findByIdAndDelete(projectId);

  return true;
};
