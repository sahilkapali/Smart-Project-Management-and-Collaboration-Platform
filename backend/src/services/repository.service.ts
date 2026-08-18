import Repository from "../models/repository.models";
import Project from "../models/project.models";
import User from "../models/user.models";

import { ROLE } from "../types/user.types";

import * as activityService from "./activity.service";

import { ActivityAction, ActivityEntityType } from "../types/activity.types";

// =====================================================
// TYPES
// =====================================================

type RepositoryAction = "VIEW" | "MANAGE";

interface CreateRepositoryData {
  project: string;
  name: string;
  description?: string;
  githubUrl?: string;
}

interface UpdateRepositoryData {
  name?: string;
  description?: string;
  githubUrl?: string;
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

const isValidObjectId = (value: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(value);
};

const cleanString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

// =====================================================
// CHECK PROJECT ACCESS
// =====================================================

export const checkProjectAccess = async (
  projectId: string,
  userId: string,
  action: RepositoryAction,
) => {
  if (!isValidObjectId(projectId)) {
    throw new Error("INVALID_PROJECT_ID");
  }

  if (!isValidObjectId(userId)) {
    throw new Error("INVALID_USER_ID");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const user = await User.findById(userId).select("role");

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const isAdmin = user.role === ROLE.ADMIN;

  const isOwner = project.createdBy?.toString() === userId;

  const isMember =
    Array.isArray(project.members) &&
    project.members.some((member) => member.toString() === userId);

  // =====================================================
  // VIEW ACCESS
  // =====================================================

  if (action === "VIEW") {
    if (isAdmin || isOwner || isMember) {
      return project;
    }

    throw new Error("PROJECT_ACCESS_DENIED");
  }

  // =====================================================
  // MANAGEMENT ACCESS
  // =====================================================

  if (action === "MANAGE") {
    if (isAdmin) {
      return project;
    }

    /*
     * Project managers can manage repositories belonging
     * to projects they own or are members of.
     */
    if (user.role === ROLE.PROJECT_MANAGER && (isOwner || isMember)) {
      return project;
    }

    /*
     * Project owner should always be able to manage
     * repositories, even if the role enum changes later.
     */
    if (isOwner) {
      return project;
    }

    throw new Error("PROJECT_MANAGE_DENIED");
  }

  throw new Error("PROJECT_ACCESS_DENIED");
};

// =====================================================
// CREATE REPOSITORY
// =====================================================

export const createRepositoryService = async (
  data: CreateRepositoryData,
  userId: string,
) => {
  const projectId = cleanString(data.project);
  const name = cleanString(data.name);

  if (!projectId) {
    throw new Error("PROJECT_ID_REQUIRED");
  }

  if (!name) {
    throw new Error("REPOSITORY_NAME_REQUIRED");
  }

  if (!isValidObjectId(projectId)) {
    throw new Error("INVALID_PROJECT_ID");
  }

  const project = await checkProjectAccess(projectId, userId, "MANAGE");

  /*
   * Prevent duplicate repository names inside the
   * same project.
   */
  const existingRepository = await Repository.findOne({
    project: project._id,
    name,
  });

  if (existingRepository) {
    throw new Error("REPOSITORY_NAME_ALREADY_EXISTS");
  }

  const repository = await Repository.create({
    project: project._id,
    name,
    description: cleanString(data.description),
    githubUrl: cleanString(data.githubUrl),
    createdBy: userId,
  });

  // =====================================================
  // ACTIVITY
  // =====================================================

  await activityService.createActivityService({
    user: userId,

    project: project._id.toString(),

    action: ActivityAction.REPOSITORY_CREATED,

    description: `Repository "${repository.name}" was created.`,

    entityType: ActivityEntityType.REPOSITORY,

    entityId: repository._id.toString(),
  });

  return Repository.findById(repository._id)
    .populate("createdBy", "name email avatar")
    .populate("project", "name description");
};

// =====================================================
// GET ALL ACCESSIBLE REPOSITORIES
// =====================================================

export const getRepositoriesService = async (userId: string) => {
  if (!isValidObjectId(userId)) {
    throw new Error("INVALID_USER_ID");
  }

  const user = await User.findById(userId).select("role");

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // =====================================================
  // ADMIN
  // =====================================================

  if (user.role === ROLE.ADMIN) {
    return Repository.find()
      .populate("createdBy", "name email avatar")
      .populate("project", "name description")
      .sort({
        createdAt: -1,
      });
  }

  // =====================================================
  // USER PROJECTS
  // =====================================================

  const projects = await Project.find({
    $or: [
      {
        createdBy: userId,
      },
      {
        members: userId,
      },
    ],
  }).select("_id");

  const projectIds = projects.map((project) => project._id);

  if (projectIds.length === 0) {
    return [];
  }

  return Repository.find({
    project: {
      $in: projectIds,
    },
  })
    .populate("createdBy", "name email avatar")
    .populate("project", "name description")
    .sort({
      createdAt: -1,
    });
};

// =====================================================
// GET PROJECT REPOSITORIES
// =====================================================

export const getProjectRepositoriesService = async (
  projectId: string,
  userId: string,
) => {
  await checkProjectAccess(projectId, userId, "VIEW");

  return Repository.find({
    project: projectId,
  })
    .populate("createdBy", "name email avatar")
    .populate("project", "name description")
    .sort({
      createdAt: -1,
    });
};

// =====================================================
// GET REPOSITORY BY ID
// =====================================================

export const getRepositoryByIdService = async (
  repositoryId: string,
  userId: string,
) => {
  if (!isValidObjectId(repositoryId)) {
    throw new Error("INVALID_REPOSITORY_ID");
  }

  const repository = await Repository.findById(repositoryId);

  if (!repository) {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  await checkProjectAccess(repository.project.toString(), userId, "VIEW");

  const populatedRepository = await Repository.findById(repositoryId)
    .populate("createdBy", "name email avatar")
    .populate("project", "name description");

  if (!populatedRepository) {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  return populatedRepository;
};

// =====================================================
// UPDATE REPOSITORY
// =====================================================

export const updateRepositoryService = async (
  repositoryId: string,
  data: UpdateRepositoryData,
  userId: string,
) => {
  if (!isValidObjectId(repositoryId)) {
    throw new Error("INVALID_REPOSITORY_ID");
  }

  const repository = await Repository.findById(repositoryId);

  if (!repository) {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  const project = await checkProjectAccess(
    repository.project.toString(),
    userId,
    "MANAGE",
  );

  const updateData: UpdateRepositoryData = {};

  if (data.name !== undefined) {
    const name = cleanString(data.name);

    if (!name) {
      throw new Error("REPOSITORY_NAME_REQUIRED");
    }

    /*
     * Don't allow another repository in the same
     * project to use the same name.
     */
    const duplicate = await Repository.findOne({
      project: repository.project,
      name,
      _id: {
        $ne: repositoryId,
      },
    });

    if (duplicate) {
      throw new Error("REPOSITORY_NAME_ALREADY_EXISTS");
    }

    updateData.name = name;
  }

  if (data.description !== undefined) {
    updateData.description = cleanString(data.description) ?? "";
  }

  if (data.githubUrl !== undefined) {
    updateData.githubUrl = cleanString(data.githubUrl) ?? "";
  }

  const updatedRepository = await Repository.findByIdAndUpdate(
    repositoryId,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("createdBy", "name email avatar")
    .populate("project", "name description");

  if (!updatedRepository) {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  // =====================================================
  // ACTIVITY
  // =====================================================

  await activityService.createActivityService({
    user: userId,

    project: project._id.toString(),

    action: ActivityAction.REPOSITORY_UPDATED,

    description: `Repository "${updatedRepository.name}" was updated.`,

    entityType: ActivityEntityType.REPOSITORY,

    entityId: updatedRepository._id.toString(),
  });

  return updatedRepository;
};

// =====================================================
// DELETE REPOSITORY
// =====================================================

export const deleteRepositoryService = async (
  repositoryId: string,
  userId: string,
) => {
  if (!isValidObjectId(repositoryId)) {
    throw new Error("INVALID_REPOSITORY_ID");
  }

  const repository = await Repository.findById(repositoryId);

  if (!repository) {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  const project = await checkProjectAccess(
    repository.project.toString(),
    userId,
    "MANAGE",
  );

  const repositoryName = repository.name;

  await Repository.findByIdAndDelete(repositoryId);

  // =====================================================
  // ACTIVITY
  // =====================================================

  await activityService.createActivityService({
    user: userId,

    project: project._id.toString(),

    action: ActivityAction.REPOSITORY_DELETED,

    description: `Repository "${repositoryName}" was deleted.`,

    entityType: ActivityEntityType.REPOSITORY,

    entityId: repositoryId,
  });

  return true;
};
