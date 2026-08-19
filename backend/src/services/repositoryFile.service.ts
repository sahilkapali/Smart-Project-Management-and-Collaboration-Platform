import RepositoryFile from "../models/repositoryFile.models";
import Repository from "../models/repository.models";
import { checkProjectAccess } from "./repository.service";
import * as activityService from "./activity.service";
import { ActivityAction, ActivityEntityType } from "../types/activity.types";
import { CreateFileData, UpdateFileData } from "../types/repository.types";

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
// CHECK REPOSITORY ACCESS WRAPPER
// =====================================================

const checkRepositoryAccess = async (
  repositoryId: string,
  userId: string,
  action: "VIEW" | "MANAGE"
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
    action
  );

  return { repository, project };
};

// =====================================================
// CREATE FILE OR FOLDER
// =====================================================

export const createFileOrFolderService = async (
  data: CreateFileData,
  userId: string
) => {
  const repositoryId = cleanString(data.repository);
  const name = cleanString(data.name);
  const path = cleanString(data.path);

  if (!repositoryId) throw new Error("REPOSITORY_ID_REQUIRED");
  if (!name) throw new Error("FILE_NAME_REQUIRED");
  if (!path) throw new Error("FILE_PATH_REQUIRED");

  const { repository, project } = await checkRepositoryAccess(
    repositoryId,
    userId,
    "MANAGE"
  );

  const versionId = cleanString(data.version);
  if (versionId && !isValidObjectId(versionId)) {
    throw new Error("INVALID_VERSION_ID");
  }

  // Ensure file path is unique per version
  const existingFile = await RepositoryFile.findOne({
    repository: repository._id,
    version: versionId || { $exists: false },
    path,
  });

  if (existingFile) {
    throw new Error("FILE_PATH_ALREADY_EXISTS");
  }

  const newFile = await RepositoryFile.create({
    repository: repository._id,
    version: versionId || undefined,
    uploadedBy: userId,
    name,
    path,
    type: data.type || "file",
    size: data.size || 0,
    mimeType: cleanString(data.mimeType) || "",
    url: cleanString(data.url),
    content: data.content,
    isBinary: Boolean(data.isBinary),
  });

  await activityService.createActivityService({
    user: userId,
    project: project._id.toString(),
    action: ActivityAction.REPOSITORY_UPDATED,
    description: `File "${newFile.path}" was added to repository "${repository.name}".`,
    entityType: ActivityEntityType.REPOSITORY,
    entityId: repository._id.toString(),
  });

  return RepositoryFile.findById(newFile._id).populate(
    "uploadedBy",
    "name email avatar"
  );
};

// =====================================================
// GET FILES BY REPOSITORY / VERSION
// =====================================================

export const getRepositoryFilesService = async (
  repositoryId: string,
  userId: string,
  versionId?: string
) => {
  await checkRepositoryAccess(repositoryId, userId, "VIEW");

  const query: Record<string, any> = { repository: repositoryId };

  if (versionId) {
    if (!isValidObjectId(versionId)) throw new Error("INVALID_VERSION_ID");
    query.version = versionId;
  } else {
    query.version = { $exists: false };
  }

  return RepositoryFile.find(query)
    .populate("uploadedBy", "name email avatar")
    .sort({ type: -1, path: 1 });
};

// =====================================================
// GET FILE BY ID
// =====================================================

export const getFileByIdService = async (fileId: string, userId: string) => {
  if (!isValidObjectId(fileId)) {
    throw new Error("INVALID_FILE_ID");
  }

  const file = await RepositoryFile.findById(fileId);

  if (!file) {
    throw new Error("FILE_NOT_FOUND");
  }

  await checkRepositoryAccess(file.repository.toString(), userId, "VIEW");

  return RepositoryFile.findById(fileId).populate(
    "uploadedBy",
    "name email avatar"
  );
};

// =====================================================
// UPDATE FILE
// =====================================================

export const updateFileService = async (
  fileId: string,
  data: UpdateFileData,
  userId: string
) => {
  if (!isValidObjectId(fileId)) throw new Error("INVALID_FILE_ID");

  const file = await RepositoryFile.findById(fileId);
  if (!file) throw new Error("FILE_NOT_FOUND");

  const { repository, project } = await checkRepositoryAccess(
    file.repository.toString(),
    userId,
    "MANAGE"
  );

  const updateData: Record<string, any> = {};

  if (data.name !== undefined) {
    const name = cleanString(data.name);
    if (!name) throw new Error("FILE_NAME_REQUIRED");
    updateData.name = name;
  }

  if (data.path !== undefined) {
    const path = cleanString(data.path);
    if (!path) throw new Error("FILE_PATH_REQUIRED");

    const duplicate = await RepositoryFile.findOne({
      repository: file.repository,
      version: file.version,
      path,
      _id: { $ne: fileId },
    });

    if (duplicate) throw new Error("FILE_PATH_ALREADY_EXISTS");
    updateData.path = path;
  }

  if (data.content !== undefined) updateData.content = data.content;
  if (data.url !== undefined) updateData.url = cleanString(data.url) ?? "";
  if (data.size !== undefined) updateData.size = data.size;
  if (data.isBinary !== undefined) updateData.isBinary = data.isBinary;

  const updatedFile = await RepositoryFile.findByIdAndUpdate(
    fileId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate("uploadedBy", "name email avatar");

  if (!updatedFile) throw new Error("FILE_NOT_FOUND");

  await activityService.createActivityService({
    user: userId,
    project: project._id.toString(),
    action: ActivityAction.REPOSITORY_UPDATED,
    description: `File "${updatedFile.path}" was updated in repository "${repository.name}".`,
    entityType: ActivityEntityType.REPOSITORY,
    entityId: repository._id.toString(),
  });

  return updatedFile;
};

// =====================================================
// DELETE FILE
// =====================================================

export const deleteFileService = async (fileId: string, userId: string) => {
  if (!isValidObjectId(fileId)) throw new Error("INVALID_FILE_ID");

  const file = await RepositoryFile.findById(fileId);
  if (!file) throw new Error("FILE_NOT_FOUND");

  const { repository, project } = await checkRepositoryAccess(
    file.repository.toString(),
    userId,
    "MANAGE"
  );

  const filePath = file.path;

  await RepositoryFile.findByIdAndDelete(fileId);

  await activityService.createActivityService({
    user: userId,
    project: project._id.toString(),
    action: ActivityAction.REPOSITORY_UPDATED,
    description: `File "${filePath}" was deleted from repository "${repository.name}".`,
    entityType: ActivityEntityType.REPOSITORY,
    entityId: repository._id.toString(),
  });

  return true;
};