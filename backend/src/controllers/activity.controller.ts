import {
  Request,
  Response,
  NextFunction
} from 'express';

import * as activityService
  from '../services/activity.service';


// =====================================================
// GET ALL ACTIVITIES
// =====================================================

export const getActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const activities =
      await activityService.getActivitiesService();

    return res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET PROJECT ACTIVITIES
// =====================================================

export const getProjectActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = req.params.projectId as string;

    const activities =
      await activityService.getProjectActivitiesService(
        projectId
      );

    return res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET ACTIVITY BY ID
// =====================================================

export const getActivityById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const activityId = req.params.id as string;

    const activity =
      await activityService.getActivityByIdService(
        activityId
      );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// DELETE ACTIVITY
// =====================================================

export const deleteActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const activityId = req.params.id as string;

    const deleted =
      await activityService.deleteActivityService(
        activityId
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};