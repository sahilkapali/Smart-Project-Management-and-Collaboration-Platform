// activity.service.ts
import { Types } from "mongoose";
import Activity from "../models/activity.models";
import { ActivityAction, ActivityEntityType } from "../types/activity.types";

interface CreateActivityData {
  user: string;
  project?: string;
  action: ActivityAction;
  description: string;
  entityType?: ActivityEntityType;
  entityId?: string;
}

// =====================================================
// OBJECT ID VALIDATION
// =====================================================

const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

// =====================================================
// CREATE ACTIVITY
// =====================================================

export const createActivityService = async (data: CreateActivityData) => {
  if (!data.user) {
    throw new Error("User ID is required");
  }

  if (!isValidObjectId(data.user)) {
    throw new Error("Invalid user ID");
  }

  if (data.project && !isValidObjectId(data.project)) {
    throw new Error("Invalid project ID");
  }

  if (data.entityId && !isValidObjectId(data.entityId)) {
    throw new Error("Invalid entity ID");
  }

  if (!data.description?.trim()) {
    throw new Error("Activity description is required");
  }

  return Activity.create({
    user: new Types.ObjectId(data.user),
    project: data.project ? new Types.ObjectId(data.project) : undefined,
    action: data.action,
    description: data.description.trim(),
    entityType: data.entityType,
    entityId: data.entityId ? new Types.ObjectId(data.entityId) : undefined,
  });
};

// =====================================================
// GET ALL ACTIVITIES
// =====================================================

export const getActivitiesService = async (limit = 100) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 100);

  return Activity.find()
    // ADDED firstName and lastName to populate
    .populate("user", "name firstName lastName email avatar")
    .populate("project", "name")
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();
};

// =====================================================
// GET ACTIVITIES BY PROJECT
// =====================================================

export const getProjectActivitiesService = async (projectId: string) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!isValidObjectId(projectId)) {
    throw new Error("Invalid project ID");
  }

  return Activity.find({ project: new Types.ObjectId(projectId) })
    .populate("user", "name firstName lastName email avatar")
    .populate("project", "name")
    .sort({ createdAt: -1 })
    .lean();
};

// =====================================================
// GET ACTIVITIES BY USER
// =====================================================

export const getUserActivitiesService = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  return Activity.find({ user: new Types.ObjectId(userId) })
    .populate("user", "name firstName lastName email avatar")
    .populate("project", "name")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
};

// =====================================================
// GET ACTIVITY BY ID
// =====================================================

export const getActivityByIdService = async (activityId: string) => {
  if (!activityId) {
    throw new Error("Activity ID is required");
  }

  if (!isValidObjectId(activityId)) {
    throw new Error("Invalid activity ID");
  }

  return Activity.findById(new Types.ObjectId(activityId))
    .populate("user", "name firstName lastName email avatar")
    .populate("project", "name")
    .lean();
};

// =====================================================
// DELETE ACTIVITY
// =====================================================

export const deleteActivityService = async (activityId: string) => {
  if (!activityId) {
    throw new Error("Activity ID is required");
  }

  if (!isValidObjectId(activityId)) {
    throw new Error("Invalid activity ID");
  }

  return Activity.findByIdAndDelete(new Types.ObjectId(activityId));
};