import mongoose from "mongoose";

import Project from "../models/project.models";
import Team from "../models/team.models";

import { PROJECT_STATUS } from "../types/project.types";
import { ROLE } from "../types/enum.types";
import AppError from "../utils/AppError.utils";
import { ERROR_CODES } from "../types/error.types";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "TEAM_MEMBER"
  | string;


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

const validateObjectId = (
  id: string,
  fieldName: string,
): void => {

  if (
    !id ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    throw new AppError(
      `Invalid ${fieldName}.`,
      ERROR_CODES.VALIDATION_ERROR,
      400,
    );
  }
};


const toObjectId = (
  id: string,
): mongoose.Types.ObjectId => {

  return new mongoose.Types.ObjectId(id);
};


/**
 * =========================================================
 * PROJECT ACCESS CHECK
 * =========================================================
 *
 * A user can access a project ONLY if:
 *
 * 1. They created the project
 * OR
 * 2. They are the owner of the project's team
 *    (project manager)
 * OR
 * 3. They are a member of the project's team
 *
 * IMPORTANT:
 *
 * Being ADMIN alone does NOT grant access.
 *
 * Being PROJECT_MANAGER alone does NOT grant access
 * to every project.
 *
 * The user must actually belong to that project's team,
 * or be the creator.
 *
 * =========================================================
 */

export const canAccessProject = async (
  projectId: string,
  userId: string,
): Promise<boolean> => {

  validateObjectId(
    projectId,
    "project ID",
  );

  validateObjectId(
    userId,
    "user ID",
  );


  const userObjectId =
    toObjectId(userId);


  const project =
    await Project.findById(
      projectId,
    ).select(
      "createdBy team",
    );


  if (!project) {
    return false;
  }


  /**
   * Project creator
   */

  if (
    project.createdBy.toString() ===
    userId
  ) {
    return true;
  }


  /**
   * Find project's team.
   */

  const team =
    await Team.findById(
      project.team,
    ).select(
      "owner members",
    );


  if (!team) {
    return false;
  }


  /**
   * Project manager / team owner
   */

  if (
    team.owner.toString() ===
    userId
  ) {
    return true;
  }


  /**
   * Team member
   */

  const isTeamMember =
    team.members.some(
      (member) =>
        member.toString() ===
        userObjectId.toString(),
    );


  return isTeamMember;
};


/**
 * =========================================================
 * REQUIRE PROJECT ACCESS
 * =========================================================
 */

export const requireProjectAccess =
  async (
    projectId: string,
    userId: string,
  ): Promise<void> => {

    const allowed =
      await canAccessProject(
        projectId,
        userId,
      );


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
  status: PROJECT_STATUS =
    PROJECT_STATUS.PLANNING,
  startDate?: Date,
  dueDate?: Date,
) => {

  validateObjectId(
    teamId,
    "team ID",
  );

  validateObjectId(
    userId,
    "user ID",
  );


  /**
   * Only ADMIN and PROJECT_MANAGER
   * can create projects.
   */

  if (
    userRole !== ROLE.ADMIN &&
    userRole !== ROLE.PROJECT_MANAGER
  ) {

    throw new AppError(
      "You are not authorized to create a project.",
      ERROR_CODES.FORBIDDEN,
      403,
    );
  }


  const team =
    await Team.findById(
      teamId,
    );


  if (!team) {

    throw new AppError(
      "Team not found.",
      ERROR_CODES.NOT_FOUND,
      404,
    );
  }


  /**
   * Project manager must belong
   * to the team they are creating
   * the project for.
   */

  if (
    userRole ===
    ROLE.PROJECT_MANAGER
  ) {

    const isTeamMember =
      team.members.some(
        (member) =>
          member.toString() ===
          userId,
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

  if (
    startDate &&
    dueDate &&
    dueDate < startDate
  ) {

    throw new AppError(
      "Due date cannot be earlier than start date.",
      ERROR_CODES.VALIDATION_ERROR,
      400,
    );
  }


  /**
   * Create project.
   *
   * The creator is also stored in
   * project.members for compatibility
   * with the existing project structure.
   */

  const project =
    await Project.create({
      name,
      description,
      team: toObjectId(teamId),
      createdBy:
        toObjectId(userId),
      members: [
        toObjectId(userId),
      ],
      status,
      startDate,
      dueDate,
    });


  return await Project.findById(
    project._id,
  )
    .populate("team")
    .populate(
      "createdBy",
      "firstName lastName email role",
    )
    .populate(
      "members",
      "firstName lastName email role",
    );
};


/**
 * =========================================================
 * GET USER PROJECTS
 * =========================================================
 *
 * IMPORTANT:
 *
 * ADMIN does NOT automatically receive
 * every project anymore.
 *
 * Instead:
 *
 * createdBy = user
 * OR
 * team.owner = user
 * OR
 * team.members contains user
 *
 * =========================================================
 */

export const getUserProjects = async (
  userId: string,
  _userRole: UserRole,
) => {

  validateObjectId(
    userId,
    "user ID",
  );


  const userObjectId =
    toObjectId(userId);


  /**
   * Find projects where:
   *
   * 1. User created project
   *
   * OR
   *
   * 2. User owns project's team
   *
   * OR
   *
   * 3. User belongs to project's team
   */

  const teams =
    await Team.find({
      members: userObjectId,
    }).select("_id");


  const teamIds =
    teams.map(
      (team) => team._id,
    );


  const ownedTeams =
    await Team.find({
      owner: userObjectId,
    }).select("_id");


  const ownedTeamIds =
    ownedTeams.map(
      (team) => team._id,
    );


  const allTeamIds = [
    ...teamIds,
    ...ownedTeamIds,
  ];


  return await Project.find({
    $or: [
      {
        createdBy:
          userObjectId,
      },

      {
        team: {
          $in: allTeamIds,
        },
      },

      {
        members:
          userObjectId,
      },
    ],
  })
    .populate("team")
    .populate(
      "createdBy",
      "firstName lastName email role",
    )
    .populate(
      "members",
      "firstName lastName email role",
    )
    .sort({
      createdAt: -1,
    });
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

  validateObjectId(
    projectId,
    "project ID",
  );

  validateObjectId(
    userId,
    "user ID",
  );


  const project =
    await Project.findById(
      projectId,
    );


  if (!project) {

    throw new AppError(
      "Project not found.",
      ERROR_CODES.NOT_FOUND,
      404,
    );
  }


  /**
   * IMPORTANT:
   *
   * No ADMIN bypass here.
   */

  await requireProjectAccess(
    projectId,
    userId,
  );


  return await Project.findById(
    projectId,
  )
    .populate("team")
    .populate(
      "createdBy",
      "firstName lastName email role",
    )
    .populate(
      "members",
      "firstName lastName email role",
    );
};


/**
 * =========================================================
 * UPDATE PROJECT
 * =========================================================
 *
 * Only:
 *
 * - Project creator
 * - Project manager/team owner
 *
 * can update the project.
 *
 * Regular team members can VIEW
 * but cannot update.
 *
 * =========================================================
 */

export const updateProject = async (
  projectId: string,
  userId: string,
  _userRole: UserRole,
  data: UpdateProjectData,
) => {

  validateObjectId(
    projectId,
    "project ID",
  );

  validateObjectId(
    userId,
    "user ID",
  );


  const project =
    await Project.findById(
      projectId,
    );


  if (!project) {

    throw new AppError(
      "Project not found.",
      ERROR_CODES.NOT_FOUND,
      404,
    );
  }


  /**
   * Creator can update.
   */

  if (
    project.createdBy.toString() ===
    userId
  ) {
    // allowed
  } else {

    /**
     * Otherwise only the team owner
     * / project manager can update.
     */

    const team =
      await Team.findById(
        project.team,
      ).select(
        "owner",
      );


    if (
      !team ||
      team.owner.toString() !==
        userId
    ) {

      throw new AppError(
        "Only the project creator or project manager can update this project.",
        ERROR_CODES.FORBIDDEN,
        403,
      );
    }
  }


  /**
   * Validate dates.
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
    finalDueDate <
      finalStartDate
  ) {

    throw new AppError(
      "Due date cannot be earlier than start date.",
      ERROR_CODES.VALIDATION_ERROR,
      400,
    );
  }


  if (
    data.name !== undefined
  ) {
    project.name =
      data.name;
  }


  if (
    data.description !==
    undefined
  ) {
    project.description =
      data.description;
  }


  if (
    data.status !== undefined
  ) {
    project.status =
      data.status;
  }


  if (
    data.startDate !==
    undefined
  ) {
    project.startDate =
      data.startDate;
  }


  if (
    data.dueDate !== undefined
  ) {
    project.dueDate =
      data.dueDate;
  }


  await project.save();


  return await Project.findById(
    project._id,
  )
    .populate("team")
    .populate(
      "createdBy",
      "firstName lastName email role",
    )
    .populate(
      "members",
      "firstName lastName email role",
    );
};


/**
 * =========================================================
 * DELETE PROJECT
 * =========================================================
 *
 * Only creator or project manager
 * can delete.
 *
 * =========================================================
 */

export const deleteProject = async (
  projectId: string,
  userId: string,
  _userRole: UserRole,
): Promise<boolean> => {

  validateObjectId(
    projectId,
    "project ID",
  );

  validateObjectId(
    userId,
    "user ID",
  );


  const project =
    await Project.findById(
      projectId,
    );


  if (!project) {

    throw new AppError(
      "Project not found.",
      ERROR_CODES.NOT_FOUND,
      404,
    );
  }


  /**
   * Creator can delete.
   */

  if (
    project.createdBy.toString() ===
    userId
  ) {

    await Project.findByIdAndDelete(
      projectId,
    );

    return true;
  }


  /**
   * Otherwise only project manager
   * / team owner can delete.
   */

  const team =
    await Team.findById(
      project.team,
    ).select(
      "owner",
    );


  if (
    !team ||
    team.owner.toString() !==
      userId
  ) {

    throw new AppError(
      "Only the project creator or project manager can delete this project.",
      ERROR_CODES.FORBIDDEN,
      403,
    );
  }


  await Project.findByIdAndDelete(
    projectId,
  );


  return true;
};