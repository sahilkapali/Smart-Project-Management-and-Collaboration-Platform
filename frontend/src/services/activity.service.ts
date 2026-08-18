import api from "./api";

import type {
  ActivityItem,
  ActivityAction,
  ActivityEntityType,
} from "../types/activity.types";

// =====================================================
// API RESPONSE TYPES
// =====================================================

interface ActivitiesResponse {
  success: boolean;
  data: ActivityItem[];
  message?: string;
}

interface SingleActivityResponse {
  success: boolean;
  data: ActivityItem;
  message?: string;
}

interface DeleteActivityResponse {
  success: boolean;
  message: string;
}

// =====================================================
// GET ALL ACTIVITIES
// =====================================================

export const getActivities = async (limit = 100): Promise<ActivityItem[]> => {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 100);

  const response = await api.get<ActivitiesResponse>("/activities", {
    params: {
      limit: safeLimit,
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch activities");
  }

  return response.data.data;
};

// =====================================================
// GET ACTIVITIES BY PROJECT
// =====================================================

export const getProjectActivities = async (
  projectId: string,
): Promise<ActivityItem[]> => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const response = await api.get<ActivitiesResponse>(
    `/activities/project/${projectId}`,
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || "Failed to fetch project activities",
    );
  }

  return response.data.data;
};

// =====================================================
// GET ACTIVITIES BY USER
// =====================================================

export const getUserActivities = async (
  userId: string,
): Promise<ActivityItem[]> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const response = await api.get<ActivitiesResponse>(
    `/activities/user/${userId}`,
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch user activities");
  }

  return response.data.data;
};

// =====================================================
// GET ACTIVITY BY ID
// =====================================================

export const getActivityById = async (
  activityId: string,
): Promise<ActivityItem> => {
  if (!activityId) {
    throw new Error("Activity ID is required");
  }

  const response = await api.get<SingleActivityResponse>(
    `/activities/${activityId}`,
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch activity");
  }

  return response.data.data;
};

// =====================================================
// DELETE ACTIVITY
// =====================================================

export const deleteActivity = async (activityId: string): Promise<string> => {
  if (!activityId) {
    throw new Error("Activity ID is required");
  }

  const response = await api.delete<DeleteActivityResponse>(
    `/activities/${activityId}`,
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete activity");
  }

  return response.data.message;
};
