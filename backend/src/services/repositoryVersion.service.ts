import RepositoryVersion from "../models/repositoryVersion.models";

// Create Repository Version
export const createVersionService = async (data: any) => {
  return await RepositoryVersion.create(data);
};

// Get all versions of a repository
export const getVersionsService = async (repositoryId: string) => {
  return await RepositoryVersion.find({
    repository: repositoryId,
  })
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 });
};

// Get version by ID
export const getVersionByIdService = async (versionId: string) => {
  return await RepositoryVersion.findById(versionId)
    .populate("uploadedBy", "name email")
    .populate("repository");
};

// Delete version
export const deleteVersionService = async (versionId: string) => {
  return await RepositoryVersion.findByIdAndDelete(versionId);
};