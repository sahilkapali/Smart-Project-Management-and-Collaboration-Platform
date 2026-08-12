import mongoose from "mongoose";

import Project from "../models/project.models";
import Team from "../models/team.models";
import User from "../models/user.models";

import { IProject, PROJECT_STATUS } from "../types/project.types";

import { ROLE } from "../types/enum.types";

/**
 * =========================================================
 * CREATE PROJECT
 * =========================================================
 *
 * ADMIN:
 * - Can create a project in any team.
 *
 * PROJECT_MANAGER:
 * - Can create a project only in a team they own.
 *
 * TEAM_MEMBER:
 * - Blocked by route authorization.
 */
export const createProject = async (
  name: string,
  description: string | undefined,
  teamId: string,
  createdBy: string,
  userRole: ROLE,
  status: PROJECT_STATUS = PROJECT_STATUS.PLANNING,
  startDate?: Date,
  dueDate?: Date,
): Promise<IProject> => {
  /**
   * Validate Team ID
   */
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new Error("Invalid team ID.");
  }

  /**
   * Validate User ID
   */
  if (!mongoose.Types.ObjectId.isValid(createdBy)) {
    throw new Error("Invalid user ID.");
  }

  /**
   * Validate dates
   */
  if (startDate && dueDate && dueDate < startDate) {
    throw new Error("Due date cannot be earlier than start date.");
  }

  const teamObjectId = new mongoose.Types.ObjectId(teamId);
  const userObjectId = new mongoose.Types.ObjectId(createdBy);

  /**
   * Find team
   */
  const team = await Team.findById(teamObjectId);

  if (!team) {
    throw new Error("Team not found.");
  }

  /**
   * Authorization
   *
   * ADMIN:
   * Can create project in any team.
   *
   * PROJECT_MANAGER:
   * Can create project only in their own team.
   */
  if (userRole !== ROLE.ADMIN && team.createdBy.toString() !== createdBy) {
    throw new Error(
      "You do not have permission to create a project in this team.",
    );
  }

  /**
   * Verify creator exists
   */
  const user = await User.findById(userObjectId);

  if (!user) {
    throw new Error("Project creator not found.");
  }

  /**
   * Create project
   */
  const project = new Project({
    name: name.trim(),

    description:
      typeof description === "string" ? description.trim() : undefined,

    team: teamObjectId,

    createdBy: userObjectId,

    status,

    startDate,

    dueDate,
  });

  await project.save();

  /**
   * Return populated project
   */
  const populatedProject = await Project.findById(project._id)
    .populate("team", "name description owner members")
    .populate("createdBy", "firstName lastName email role");

  if (!populatedProject) {
    throw new Error("Project could not be retrieved after creation.");
  }

  return populatedProject as IProject;
};

/**
 * =========================================================
 * GET PROJECTS
 * =========================================================
 *
 * Returns projects belonging to teams where the
 * current user is a member.
 *
 * ADMIN:
 * - Can see all projects.
 *
 * PROJECT_MANAGER:
 * - Can see projects in their teams.
 *
 * TEAM_MEMBER:
 * - Can see projects in teams they belong to.
 */
export const getUserProjects = async (
  userId: string,
  userRole: ROLE,
): Promise<IProject[]> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  let projects;

  /**
   * ADMIN can see every project.
   */
  if (userRole === ROLE.ADMIN) {
    projects = await Project.find()
      .populate("team", "name description owner members")
      .populate("createdBy", "firstName lastName email role")
      .sort({ createdAt: -1 });
  } else {
    /**
     * Other users can only see projects
     * belonging to teams they are members of.
     */
    const teams = await Team.find({
      members: userObjectId,
    }).select("_id");

    const teamIds = teams.map((team) => team._id);

    projects = await Project.find({
      team: { $in: teamIds },
    })
      .populate("team", "name description owner members")
      .populate("createdBy", "firstName lastName email role")
      .sort({ createdAt: -1 });
  }

  return projects as IProject[];
};

/**
 * =========================================================
 * GET SINGLE PROJECT
 * =========================================================
 *
 * User must belong to the project's team.
 *
 * ADMIN:
 * - Can view any project.
 */
export const getProjectById = async (
  projectId: string,
  userId: string,
  userRole: ROLE,
): Promise<IProject> => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  /**
   * Admin can view any project.
   */
  if (userRole === ROLE.ADMIN) {
    const populatedProject = await Project.findById(project._id)
      .populate("team", "name description owner members")
      .populate("createdBy", "firstName lastName email role");

    if (!populatedProject) {
      throw new Error("Project not found.");
    }

    return populatedProject as IProject;
  }

  /**
   * Check team membership.
   */
  const team = await Team.findOne({
    _id: project.team,
    members: new mongoose.Types.ObjectId(userId),
  });

  if (!team) {
    throw new Error("You are not a member of this project's team.");
  }

  const populatedProject = await Project.findById(project._id)
    .populate("team", "name description owner members")
    .populate("createdBy", "firstName lastName email role");

  if (!populatedProject) {
    throw new Error("Project not found.");
  }

  return populatedProject as IProject;
};

/**
 * =========================================================
 * UPDATE PROJECT
 * =========================================================
 *
 * ADMIN:
 * - Can update any project.
 *
 * PROJECT_MANAGER:
 * - Can update projects in their own team.
 *
 * TEAM_MEMBER:
 * - Blocked by route authorization.
 */
export const updateProject = async (
  projectId: string,
  userId: string,
  userRole: ROLE,
  data: {
    name?: string;
    description?: string;
    status?: PROJECT_STATUS;
    startDate?: Date;
    dueDate?: Date;
  },
): Promise<IProject> => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  /**
   * Find project team
   */
  const team = await Team.findById(project.team);

  if (!team) {
    throw new Error("Project's team could not be found.");
  }

  /**
   * Authorization
   *
   * Admin → any project
   *
   * Project Manager → own team only
   */
  if (userRole !== ROLE.ADMIN && team.createdBy.toString() !== userId) {
    throw new Error("You do not have permission to update this project.");
  }

  /**
   * Update name
   */
  if (data.name !== undefined) {
    const name = data.name.trim();

    if (name.length < 3) {
      throw new Error("Project name must be at least 3 characters long.");
    }

    if (name.length > 100) {
      throw new Error("Project name cannot exceed 100 characters.");
    }

    project.name = name;
  }

  /**
   * Update description
   */
  if (data.description !== undefined) {
    project.description = data.description.trim();
  }

  /**
   * Update status
   */
  if (data.status !== undefined) {
    const allowedStatuses: PROJECT_STATUS[] = [
      PROJECT_STATUS.PLANNING,
      PROJECT_STATUS.ACTIVE,
      PROJECT_STATUS.COMPLETED,
      PROJECT_STATUS.ARCHIVED,
    ];

    if (!allowedStatuses.includes(data.status)) {
      throw new Error("Invalid project status.");
    }

    project.status = data.status;
  }

  /**
   * Update dates
   */
  if (data.startDate !== undefined) {
    project.startDate = data.startDate;
  }

  if (data.dueDate !== undefined) {
    project.dueDate = data.dueDate;
  }

  /**
   * Check date relationship after updates.
   */
  if (
    project.startDate &&
    project.dueDate &&
    project.dueDate < project.startDate
  ) {
    throw new Error("Due date cannot be earlier than start date.");
  }

  await project.save();

  /**
   * Return populated project.
   */
  const updatedProject = await Project.findById(project._id)
    .populate("team", "name description owner members")
    .populate("createdBy", "firstName lastName email role");

  if (!updatedProject) {
    throw new Error("Project could not be retrieved after updating.");
  }

  return updatedProject as IProject;
};

/**
 * =========================================================
 * DELETE PROJECT
 * =========================================================
 *
 * ADMIN:
 * - Can delete any project.
 *
 * PROJECT_MANAGER:
 * - Can delete project in their own team.
 *
 * TEAM_MEMBER:
 * - Blocked by route authorization.
 */
export const deleteProject = async (
  projectId: string,
  userId: string,
  userRole: ROLE,
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  /**
   * Find project team.
   */
  const team = await Team.findById(project.team);

  if (!team) {
    throw new Error("Project's team could not be found.");
  }

  /**
   * Authorization
   */
  if (userRole !== ROLE.ADMIN && team.createdBy.toString() !== userId) {
    throw new Error("You do not have permission to delete this project.");
  }

  await Project.findByIdAndDelete(projectId);
};
