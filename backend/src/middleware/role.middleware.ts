import {
  Request,
  Response,
  NextFunction
} from 'express';

import Project from '../models/project.models';

import { ROLE } from '../types/user.types';


// =====================================================
// CHECK PROJECT MEMBERSHIP
// =====================================================

export const checkProjectMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const projectId =
      (req.params.projectId as string) ||
      (req.body.project as string);

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwner =
      project.createdBy.toString() === userId;

    const isMember =
      project.members.some(
        (member) => member.toString() === userId
      );

    const isAdmin =
      req.user?.role === ROLE.ADMIN;

    if (!isOwner && !isMember && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          'You are not a member of this project'
      });
    }

    req.project = project;

    next();

  } catch (error) {
    next(error);
  }
};


// =====================================================
// CHECK PROJECT MANAGEMENT ACCESS
// =====================================================

export const checkProjectManagementAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const projectId =
      (req.params.projectId as string) ||
      (req.body.project as string);

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isAdmin =
      req.user?.role === ROLE.ADMIN;

    const isOwner =
      project.createdBy.toString() === userId;

    const isProjectManager =
      req.user?.role === ROLE.PROJECT_MANAGER;

    const isMember =
      project.members.some(
        (member) => member.toString() === userId
      );

    // ADMIN
    if (isAdmin) {
      req.project = project;
      return next();
    }

    // PROJECT MANAGER
    if (
      isProjectManager &&
      (isOwner || isMember)
    ) {
      req.project = project;
      return next();
    }

    return res.status(403).json({
      success: false,
      message:
        'You do not have permission to manage repositories in this project'
    });

  } catch (error) {
    next(error);
  }
};