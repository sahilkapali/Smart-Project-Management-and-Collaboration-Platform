import { Types } from 'mongoose';

import Activity from '../models/activity.models';

import {
  ActivityAction,
  ActivityEntityType
} from '../types/activity.types';


// =====================================================
// CREATE ACTIVITY
// =====================================================

export const createActivityService = async (data: {
  user: string;
  project?: string;
  action: ActivityAction;
  description: string;
  entityType?: ActivityEntityType;
  entityId?: string;
}) => {
  return await Activity.create({
    user: new Types.ObjectId(data.user),

    project: data.project
      ? new Types.ObjectId(data.project)
      : undefined,

    action: data.action,

    description: data.description,

    entityType: data.entityType,

    entityId: data.entityId
      ? new Types.ObjectId(data.entityId)
      : undefined
  });
};


// =====================================================
// GET ALL ACTIVITIES
// =====================================================

export const getActivitiesService = async () => {
  return await Activity.find()
    .populate('user', 'name email avatar')
    .populate('project', 'name')
    .sort({ createdAt: -1 })
    .limit(100);
};


// =====================================================
// GET ACTIVITIES BY PROJECT
// =====================================================

export const getProjectActivitiesService = async (
  projectId: string
) => {
  return await Activity.find({
    project: projectId
  })
    .populate('user', 'name email avatar')
    .populate('project', 'name')
    .sort({ createdAt: -1 });
};


// =====================================================
// GET ACTIVITY BY ID
// =====================================================

export const getActivityByIdService = async (
  activityId: string
) => {
  return await Activity.findById(activityId)
    .populate('user', 'name email avatar')
    .populate('project', 'name');
};


// =====================================================
// DELETE ACTIVITY
// =====================================================

export const deleteActivityService = async (
  activityId: string
) => {
  return await Activity.findByIdAndDelete(activityId);
};