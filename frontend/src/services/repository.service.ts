import api from './api';
import type {
  Repository,
  FileNode,
  RepositoryIssue,
  RepositoryVersion,
  CreateVersionPayload
} from '../types/repository.types';

const ENDPOINT = '/repositories';

export const getRepositories = async (): Promise<Repository[]> => {
  const response = await api.get(ENDPOINT);
  return response.data?.data || response.data || [];
};

export const getRepositoryById = async (id: string): Promise<Repository> => {
  const response = await api.get(`${ENDPOINT}/${id}`);
  return response.data?.data || response.data;
};

export const createRepository = async (data: Partial<Repository>): Promise<Repository> => {
  const response = await api.post(ENDPOINT, data);
  return response.data;
};

export const updateRepository = async (id: string, data: Partial<Repository>): Promise<Repository> => {
  const response = await api.patch(`${ENDPOINT}/${id}`, data);
  return response.data;
};

export const deleteRepository = async (id: string) => {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
};

export const uploadRepositoryVersion = async (repositoryId: string, formData: FormData): Promise<RepositoryVersion> => {
  const response = await api.post(`${ENDPOINT}/${repositoryId}/versions`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data?.data || response.data;
};

export const getRepositoryVersions = async (repositoryId: string): Promise<RepositoryVersion[]> => {
  const response = await api.get(`${ENDPOINT}/${repositoryId}/versions`);
  return response.data?.data || response.data || [];
};

export const createRepositoryVersion = async (
  repositoryId: string,
  payload: CreateVersionPayload
): Promise<RepositoryVersion> => {
  const formData = new FormData();
  formData.append('versionNumber', payload.versionNumber);
  if (payload.title) formData.append('title', payload.title);
  if (payload.changelog) formData.append('changelog', payload.changelog);
  if (payload.commitHash) formData.append('commitHash', payload.commitHash);
  if (payload.file) formData.append('file', payload.file);

  return uploadRepositoryVersion(repositoryId, formData);
};

export const getRepositoryFiles = async (id: string, path: string = ''): Promise<FileNode[]> => {
  const url = path 
    ? `${ENDPOINT}/${id}/files?path=${encodeURIComponent(path)}` 
    : `${ENDPOINT}/${id}/files`;
  const response = await api.get(url);
  return response.data?.data || response.data || [];
};

export const getRepositoryIssues = async (id: string): Promise<RepositoryIssue[]> => {
  const response = await api.get(`${ENDPOINT}/${id}/issues`);
  return response.data?.data || response.data || [];
};