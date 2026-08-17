import api from './api';
import type { Issue, CreateIssuePayload, IssueComment } from '../types/issues.types';

const ENDPOINT = '/issues';

export const getIssues = async (params?: { repositoryId?: string; projectId?: string }): Promise<Issue[]> => {
  const response = await api.get(ENDPOINT, { params });
  return response.data?.data || response.data || [];
};

export const getIssueById = async (id: string): Promise<Issue> => {
  const response = await api.get(`${ENDPOINT}/${id}`);
  return response.data?.data || response.data;
};

export const createIssue = async (data: CreateIssuePayload): Promise<Issue> => {
  const response = await api.post(ENDPOINT, data);
  return response.data?.data || response.data;
};

export const updateIssue = async (id: string, data: Partial<Issue>): Promise<Issue> => {
  const response = await api.patch(`${ENDPOINT}/${id}`, data);
  return response.data?.data || response.data;
};

export const deleteIssue = async (id: string): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};

// Comment endpoints (assuming they live under /issues/:id/comments)
export const getIssueComments = async (issueId: string): Promise<IssueComment[]> => {
  const response = await api.get(`${ENDPOINT}/${issueId}/comments`);
  return response.data?.data || response.data || [];
};

export const addIssueComment = async (issueId: string, text: string): Promise<IssueComment> => {
  const response = await api.post(`${ENDPOINT}/${issueId}/comments`, { text });
  return response.data?.data || response.data;
};