import Repository from "../models/repository.models";
import RepositoryVersion from "../models/repositoryVersion.models";
import * as repositoryService from "./repository.service";

interface CreateVersionData {
  repository: string;
  versionNumber: string;
  title: string;
  changelog?: string;
  commitHash?: string;
  file?: string;
  uploadedBy: string;
}

export const createVersionService = async (data: CreateVersionData) => {
  const repository = await Repository.findById(data.repository);

  if (!repository) {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  await repositoryService.checkProjectAccess(
    repository.project.toString(),
    data.uploadedBy,
    "MANAGE",
  );

  const existingVersion = await RepositoryVersion.findOne({
    repository: data.repository,
    versionNumber: data.versionNumber.trim(),
  });

  if (existingVersion) {
    throw new Error("VERSION_ALREADY_EXISTS");
  }

  const version = await RepositoryVersion.create({
    repository: data.repository,
    versionNumber: data.versionNumber.trim(),
    title: data.title.trim(),
    changelog: data.changelog?.trim() || "",
    commitHash: data.commitHash?.trim() || "",
    file: data.file || "",
    uploadedBy: data.uploadedBy,
  });

  return await RepositoryVersion.findById(version._id)
    .populate("repository", "name description project")
    .populate("uploadedBy", "name email avatar");
};

export const getVersionsService = async (
  repositoryId: string,
  userId: string,
) => {
  const repository = await Repository.findById(repositoryId);

  if (!repository) {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  await repositoryService.checkProjectAccess(
    repository.project.toString(),
    userId,
    "VIEW",
  );

  return await RepositoryVersion.find({
    repository: repositoryId,
  })
    .populate("uploadedBy", "name email avatar")
    .sort({
      createdAt: -1,
    });
};

export const getVersionByIdService = async (
  repositoryId: string,
  versionId: string,
  userId: string,
) => {
  const repository = await Repository.findById(repositoryId);

  if (!repository) {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  await repositoryService.checkProjectAccess(
    repository.project.toString(),
    userId,
    "VIEW",
  );

  return await RepositoryVersion.findOne({
    _id: versionId,
    repository: repositoryId,
  }).populate("uploadedBy", "name email avatar");
};

export const deleteVersionService = async (
  repositoryId: string,
  versionId: string,
  userId: string,
) => {
  const repository = await Repository.findById(repositoryId);

  if (!repository) {
    throw new Error("REPOSITORY_NOT_FOUND");
  }

  await repositoryService.checkProjectAccess(
    repository.project.toString(),
    userId,
    "MANAGE",
  );

  return await RepositoryVersion.findOneAndDelete({
    _id: versionId,
    repository: repositoryId,
  });
};
