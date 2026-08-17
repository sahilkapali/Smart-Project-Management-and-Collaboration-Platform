import api from './api';
import type { ActivityItem, ActivityFilterParams } from '../types/activity.types';

const ENDPOINT = '/activities';

export const getActivities = async (params?: ActivityFilterParams): Promise<ActivityItem[]> => {
  const response = await api.get(ENDPOINT, { params });
  return response.data?.data || response.data || [];
};

export const getProjectActivities = async (projectId: string): Promise<ActivityItem[]> => {
  const response = await api.get(`${ENDPOINT}/project/${projectId}`);
  return response.data?.data || response.data || [];
};