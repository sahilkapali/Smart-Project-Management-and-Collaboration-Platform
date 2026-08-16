import api from './api';
import type { RepositoryResponse } from '../types/repository.types';

const ENDPOINT = '/repositories'; 

export const getRepositoryItems = async (): Promise<RepositoryResponse> => {
  const response = await api.get<RepositoryResponse>(ENDPOINT);
  return response.data;
};

export interface CreateRepositoryPayload {
  name: string;
  project: string; 
  description?: string;
  githubUrl?: string;
}

export const createRepository = async (data: CreateRepositoryPayload) => {
  const response = await api.post(ENDPOINT, data);
  return response.data;
};


export const updateRepository = async (id: string, data: Partial<CreateRepositoryPayload>) => {
  const response = await api.patch(`${ENDPOINT}/${id}`, data);
  return response.data;
};

export const deleteRepository = async (id: string) => {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
};