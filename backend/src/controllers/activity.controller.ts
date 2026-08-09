import { Response } from "express";
import { AuthRequest } from "../types/custom";

// services import - use require to avoid TS path resolution errors in some setups
// @ts-ignore
const {
  createActivityService,
  getActivitiesService,
  getProjectActivitiesService,
  getActivityByIdService,
  deleteActivityService,
} = require("../services/activity.service");

// Create Activity
export const createActivity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      project,
      action,
      entityType,
      entityId,
      description,
    } = req.body;

    // Validation
    if (!action || !entityType || !description) {
      res.status(400).json({
        success: false,
        message:
          "Action, entity type and description are required.",
      });
      return;
    }

    // User validation
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
      return;
    }

    // Create activity
    const activity = await createActivityService({
      user: req.user.id,
      project,
      action,
      entityType,
      entityId,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Activity created successfully.",
      data: activity,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All Activities
export const getActivities = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const activities = await getActivitiesService();

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Project Activities
export const getProjectActivities = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;

    // Validation
    if (!projectId) {
      res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
      return;
    }

    const activities =
      await getProjectActivitiesService(projectId);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Activity By ID
export const getActivityById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Activity ID is required.",
      });
      return;
    }

    const activity = await getActivityByIdService(id);

    if (!activity) {
      res.status(404).json({
        success: false,
        message: "Activity not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete Activity
export const deleteActivity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Activity ID is required.",
      });
      return;
    }

    const activity = await deleteActivityService(id);

    if (!activity) {
      res.status(404).json({
        success: false,
        message: "Activity not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully.",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};