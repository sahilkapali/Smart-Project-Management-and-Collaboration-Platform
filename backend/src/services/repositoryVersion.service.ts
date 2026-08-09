import RepositoryVersion from "../models/repositoryVersion.models";

export const createVersionService = async (data: any) => {
  return await RepositoryVersion.create(data);
};

export const getVersionsService = async (repositoryId: string) => {
  return await RepositoryVersion.find({
    repository: repositoryId,
  })
    .populate("uploadedBy")
    .sort({ createdAt: -1 });
};

export const getVersionByIdService = async (versionId: string) => {
  return await RepositoryVersion.findById(versionId)
    .populate("uploadedBy")
    .populate("repository");
};

export const deleteVersionService = async (versionId: string) => {
  return await RepositoryVersion.findByIdAndDelete(versionId);
};