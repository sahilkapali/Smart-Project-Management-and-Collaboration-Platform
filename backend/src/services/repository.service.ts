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
  defaultBranch?: string;
}

interface UpdateRepositoryData {
  name?: string;
  description?: string;
  githubUrl?: string;
  defaultBranch?: string;
  status?: "active" | "archived" | "deleted";
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
  if (!isValidObjectId(projectId)) throw new Error("INVALID_PROJECT_ID");
  if (!isValidObjectId(userId)) throw new Error("INVALID_USER_ID");

  const project = await Project.findById(projectId).exec();
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  const user = await User.findById(userId).select("role").exec();
  if (!user) throw new Error("USER_NOT_FOUND");

  const isAdmin = user.role === ROLE.ADMIN;
  const isOwner = project.createdBy?.toString() === userId;
  const isMember =
    Array.isArray(project.members) &&
    project.members.some((member) => member.toString() === userId);

  // VIEW ACCESS
  if (action === "VIEW") {
    if (isAdmin || isOwner || isMember) return project;
    throw new Error("PROJECT_ACCESS_DENIED");
  }

  // MANAGEMENT ACCESS
  if (action === "MANAGE") {
    if (isAdmin) return project;
    if (user.role === ROLE.PROJECT_MANAGER && (isOwner || isMember))
      return project;
    if (isOwner) return project;
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

  if (!projectId) throw new Error("PROJECT_ID_REQUIRED");
  if (!name) throw new Error("REPOSITORY_NAME_REQUIRED");
  if (!isValidObjectId(projectId)) throw new Error("INVALID_PROJECT_ID");

  const project = await checkProjectAccess(projectId, userId, "MANAGE");

  const existingRepository = await Repository.findOne({
    project: project._id,
    name,
    status: { $ne: "deleted" },
  }).exec();

  if (existingRepository) {
    throw new Error("REPOSITORY_NAME_ALREADY_EXISTS");
  }

  const repository = await Repository.create({
    project: project._id,
    name,
    description: cleanString(data.description),
    githubUrl: cleanString(data.githubUrl),
    defaultBranch: cleanString(data.defaultBranch) || "main",
    createdBy: userId,
    status: "active",
  });

  await activityService.createActivityService({
    user: userId,
    project: project._id.toString(),
    action: ActivityAction.REPOSITORY_CREATED,
    description: `Repository "${repository.name}" was created.`,
    entityType: ActivityEntityType.REPOSITORY,
    entityId: repository._id.toString(),
  });

  return await Repository.findById(repository._id)
    .populate("createdBy", "name email avatar")
    .populate("project", "name description")
    .exec();
};

// =====================================================
// GET ALL ACCESSIBLE REPOSITORIES
// =====================================================

export const getRepositoriesService = async (userId: string) => {
  if (!isValidObjectId(userId)) throw new Error("INVALID_USER_ID");

  const user = await User.findById(userId).select("role").exec();
  if (!user) throw new Error("USER_NOT_FOUND");

  // ADMIN
  if (user.role === ROLE.ADMIN) {
    return await Repository.find({ status: { $ne: "deleted" } })
      .populate("createdBy", "name email avatar")
      .populate("project", "name description")
      .sort({ createdAt: -1 })
      .exec();
  }

  // USER PROJECTS
  const projects = await Project.find({
    $or: [{ createdBy: userId }, { members: userId }],
  })
    .select("_id")
    .exec();

  const projectIds = projects.map((project) => project._id);

  if (projectIds.length === 0) return [];

  return await Repository.find({
    project: { $in: projectIds },
    status: { $ne: "deleted" },
  })
    .populate("createdBy", "name email avatar")
    .populate("project", "name description")
    .sort({ createdAt: -1 })
    .exec();
};

// =====================================================
// GET PROJECT REPOSITORIES
// =====================================================

export const getProjectRepositoriesService = async (
  projectId: string,
  userId: string,
) => {
  await checkProjectAccess(projectId, userId, "VIEW");

  return await Repository.find({
    project: projectId,
    status: { $ne: "deleted" },
  })
    .populate("createdBy", "name email avatar")
    .populate("project", "name description")
    .sort({ createdAt: -1 })
    .exec();
};

// =====================================================
// GET REPOSITORY BY ID
// =====================================================

export const getRepositoryByIdService = async (
  repositoryId: string,
  userId: string,
) => {
  if (!isValidObjectId(repositoryId)) throw new Error("INVALID_REPOSITORY_ID");

  const repository = await Repository.findById(repositoryId).exec();
  if (!repository || repository.status === "deleted") {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  await checkProjectAccess(repository.project.toString(), userId, "VIEW");

  return await Repository.findById(repositoryId)
    .populate("createdBy", "name email avatar")
    .populate("project", "name description")
    .exec();
};

// =====================================================
// UPDATE REPOSITORY
// =====================================================

export const updateRepositoryService = async (
  repositoryId: string,
  data: UpdateRepositoryData,
  userId: string,
) => {
  if (!isValidObjectId(repositoryId)) throw new Error("INVALID_REPOSITORY_ID");

  const repository = await Repository.findById(repositoryId).exec();
  if (!repository || repository.status === "deleted") {
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
    if (!name) throw new Error("REPOSITORY_NAME_REQUIRED");

    const duplicate = await Repository.findOne({
      project: repository.project,
      name,
      status: { $ne: "deleted" },
      _id: { $ne: repositoryId },
    }).exec();

    if (duplicate) throw new Error("REPOSITORY_NAME_ALREADY_EXISTS");
    updateData.name = name;
  }

  if (data.description !== undefined)
    updateData.description = cleanString(data.description) ?? "";
  if (data.githubUrl !== undefined)
    updateData.githubUrl = cleanString(data.githubUrl) ?? "";
  if (data.defaultBranch !== undefined)
    updateData.defaultBranch = cleanString(data.defaultBranch) ?? "main";
  if (data.status !== undefined) updateData.status = data.status;

  const updatedRepository = await Repository.findByIdAndUpdate(
    repositoryId,
    { $set: updateData },
    { new: true, runValidators: true },
  )
    .populate("createdBy", "name email avatar")
    .populate("project", "name description")
    .exec();

  if (!updatedRepository) throw new Error("REPOSITORY_NOT_FOUND");

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
// DELETE REPOSITORY (Soft Delete)
// =====================================================

export const deleteRepositoryService = async (
  repositoryId: string,
  userId: string,
) => {
  if (!isValidObjectId(repositoryId)) throw new Error("INVALID_REPOSITORY_ID");

  const repository = await Repository.findById(repositoryId).exec();
  if (!repository || repository.status === "deleted") {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  const project = await checkProjectAccess(
    repository.project.toString(),
    userId,
    "MANAGE",
  );

  const repositoryName = repository.name;

  await Repository.findByIdAndUpdate(repositoryId, {
    $set: { status: "deleted" },
  }).exec();

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