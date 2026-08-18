import RepositoryVersion from "../models/repositoryVersion.models";
import Repository from "../models/repository.models";
import { checkProjectAccess } from "./repository.service";
import * as activityService from "./activity.service";
import { ActivityAction, ActivityEntityType } from "../types/activity.types";
import {
  CreateVersionData,
  UpdateVersionData,
} from "../types/repository.types";

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
// CHECK REPOSITORY ACCESS HELPER
// =====================================================

export const checkRepositoryAccess = async (
  repositoryId: string,
  userId: string,
  action: "VIEW" | "MANAGE",
) => {
  if (!isValidObjectId(repositoryId)) {
    throw new Error("INVALID_REPOSITORY_ID");
  }

  const repository = await Repository.findById(repositoryId);

  if (!repository || repository.status === "deleted") {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  const project = await checkProjectAccess(
    repository.project.toString(),
    userId,
    action,
  );

  return { repository, project };
};

// =====================================================
// CREATE VERSION
// =====================================================

export const createVersionService = async (data: CreateVersionData) => {
  const repositoryId = cleanString(data.repository);
  const versionNumber = cleanString(data.versionNumber);
  const title = cleanString(data.title);
  const uploadedBy = cleanString(data.uploadedBy);

  if (!repositoryId) throw new Error("REPOSITORY_ID_REQUIRED");
  if (!versionNumber) throw new Error("VERSION_NUMBER_REQUIRED");
  if (!title) throw new Error("VERSION_TITLE_REQUIRED");
  if (!uploadedBy) throw new Error("USER_ID_REQUIRED");

  const { repository, project } = await checkRepositoryAccess(
    repositoryId,
    uploadedBy,
    "MANAGE",
  );

  // Check for duplicate version tag in the same repository
  const existingVersion = await RepositoryVersion.findOne({
    repository: repository._id,
    versionNumber,
  });

  if (existingVersion) {
    throw new Error("VERSION_NUMBER_ALREADY_EXISTS");
  }

  const newVersion = await RepositoryVersion.create({
    repository: repository._id,
    versionNumber,
    title,
    changelog: cleanString(data.changelog) || "",
    commitHash: cleanString(data.commitHash) || "",
    archiveUrl: cleanString(data.archiveUrl) || "",
    uploadedBy,
  });

  // Log activity
  await activityService.createActivityService({
    user: uploadedBy,
    project: project._id.toString(),
    action: ActivityAction.REPOSITORY_UPDATED,
    description: `Version "${newVersion.versionNumber}" was created in repository "${repository.name}".`,
    entityType: ActivityEntityType.REPOSITORY,
    entityId: repository._id.toString(),
  });

  return await RepositoryVersion.findById(newVersion._id)
    .populate("repository", "name description project")
    .populate("uploadedBy", "name email avatar");
};

export const createRepositoryVersionService = createVersionService;

// =====================================================
// GET ALL VERSIONS FOR A REPOSITORY
// =====================================================

export const getVersionsService = async (
  repositoryId: string,
  userId: string,
) => {
  await checkRepositoryAccess(repositoryId, userId, "VIEW");

  return RepositoryVersion.find({ repository: repositoryId })
    .populate("repository", "name description project")
    .populate("uploadedBy", "name email avatar")
    .sort({ createdAt: -1 });
};

export const getRepositoryVersionsService = getVersionsService;

// =====================================================
// GET VERSION BY ID
// =====================================================

export const getVersionByIdService = async (
  versionId: string,
  userId: string,
) => {
  if (!isValidObjectId(versionId)) {
    throw new Error("INVALID_VERSION_ID");
  }

  const version = await RepositoryVersion.findById(versionId);

  if (!version) {
    throw new Error("VERSION_NOT_FOUND");
  }

  await checkRepositoryAccess(version.repository.toString(), userId, "VIEW");

  return RepositoryVersion.findById(versionId)
    .populate("repository", "name description project")
    .populate("uploadedBy", "name email avatar");
};

export const getRepositoryVersionByIdService = getVersionByIdService;

// =====================================================
// UPDATE VERSION
// =====================================================

export const updateVersionService = async (
  versionId: string,
  data: UpdateVersionData,
  userId: string,
) => {
  if (!isValidObjectId(versionId)) throw new Error("INVALID_VERSION_ID");

  const version = await RepositoryVersion.findById(versionId);
  if (!version) throw new Error("VERSION_NOT_FOUND");

  const { repository, project } = await checkRepositoryAccess(
    version.repository.toString(),
    userId,
    "MANAGE",
  );

  const updateData: Record<string, any> = {};

  if (data.title !== undefined) {
    const title = cleanString(data.title);
    if (!title) throw new Error("VERSION_TITLE_REQUIRED");
    updateData.title = title;
  }

  if (data.changelog !== undefined) {
    updateData.changelog = cleanString(data.changelog) ?? "";
  }

  if (data.commitHash !== undefined) {
    updateData.commitHash = cleanString(data.commitHash) ?? "";
  }

  if (data.archiveUrl !== undefined) {
    updateData.archiveUrl = cleanString(data.archiveUrl) ?? "";
  }

  const updatedVersion = await RepositoryVersion.findByIdAndUpdate(
    versionId,
    { $set: updateData },
    { new: true, runValidators: true },
  )
    .populate("repository", "name description project")
    .populate("uploadedBy", "name email avatar");

  if (!updatedVersion) throw new Error("VERSION_NOT_FOUND");

  await activityService.createActivityService({
    user: userId,
    project: project._id.toString(),
    action: ActivityAction.REPOSITORY_UPDATED,
    description: `Version "${updatedVersion.versionNumber}" in repository "${repository.name}" was updated.`,
    entityType: ActivityEntityType.REPOSITORY,
    entityId: repository._id.toString(),
  });

  return updatedVersion;
};

export const updateRepositoryVersionService = updateVersionService;

// =====================================================
// DELETE VERSION
// =====================================================

export const deleteVersionService = async (
  versionId: string,
  userId: string,
) => {
  if (!isValidObjectId(versionId)) throw new Error("INVALID_VERSION_ID");

  const version = await RepositoryVersion.findById(versionId);
  if (!version) throw new Error("VERSION_NOT_FOUND");

  const { repository, project } = await checkRepositoryAccess(
    version.repository.toString(),
    userId,
    "MANAGE",
  );

  const versionNumber = version.versionNumber;

  await RepositoryVersion.findByIdAndDelete(versionId);

  await activityService.createActivityService({
    user: userId,
    project: project._id.toString(),
    action: ActivityAction.REPOSITORY_UPDATED,
    description: `Version "${versionNumber}" was deleted from repository "${repository.name}".`,
    entityType: ActivityEntityType.REPOSITORY,
    entityId: repository._id.toString(),
  });

  return true;
};

export const deleteRepositoryVersionService = deleteVersionService;
