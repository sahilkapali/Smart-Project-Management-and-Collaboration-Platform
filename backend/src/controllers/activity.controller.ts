import { Request, Response, NextFunction } from "express";

import * as activityService from "../services/activity.service";

// =====================================================
// NORMALIZE ROUTE PARAMETER
// =====================================================

const getStringParam = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

// =====================================================
// GET ALL ACTIVITIES
// =====================================================

export const getActivities = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requestedLimit = Number(req.query.limit);

    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 100;

    const activities = await activityService.getActivitiesService(limit);

    return res.status(200).json({
      success: true,
      data: activities,
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
  next: NextFunction,
) => {
  try {
    const projectId = getStringParam(req.params.projectId);

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const activities =
      await activityService.getProjectActivitiesService(projectId);

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET USER ACTIVITIES
// =====================================================

export const getUserActivities = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getStringParam(req.params.userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const activities = await activityService.getUserActivitiesService(userId);

    return res.status(200).json({
      success: true,
      data: activities,
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
  next: NextFunction,
) => {
  try {
    const activityId = getStringParam(req.params.id);

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "Activity ID is required",
      });
    }

    const activity = await activityService.getActivityByIdService(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: activity,
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
  next: NextFunction,
) => {
  try {
    const activityId = getStringParam(req.params.id);

    if (!activityId) {
      return res.status(400).json({
        success: false,
        message: "Activity ID is required",
      });
    }

    const deleted = await activityService.deleteActivityService(activityId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
