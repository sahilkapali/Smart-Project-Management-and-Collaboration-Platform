import Repository from "../models/repository.models";

export const createRepositoryService = async (data: any) => {
  return await Repository.create(data);
};

export const getRepositoriesService = async () => {
  return await Repository.find()
    .populate("project")
    .populate("createdBy");
};

export const getRepositoryByIdService = async (id: string) => {
  return await Repository.findById(id)
    .populate("project")
    .populate("createdBy");
};

export const updateRepositoryService = async (
  id: string,
  data: any
) => {
  return await Repository.findByIdAndUpdate(id, data, {
    new: true,
  });
};

export const deleteRepositoryService = async (id: string) => {
  return await Repository.findByIdAndDelete(id);
};