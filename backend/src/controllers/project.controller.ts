import { Response, NextFunction } from "express";
import mongoose from "mongoose";

import { AuthRequest } from "../types/custom";
import * as projectService from "../services/project.service";
import { PROJECT_STATUS } from "../types/project.types";

// =====================================================
// CREATE PROJECT
// =====================================================

export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized.",
        data: null,
      });
      return;
    }

    const { name, description, teamId, status, startDate, dueDate } = req.body;

    // -------------------------------------------------
    // Name validation
    // -------------------------------------------------

    if (!name || typeof name !== "string") {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Project name is required and must be a string.",
        data: null,
      });
      return;
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Project name must be at least 3 characters long.",
        data: null,
      });
      return;
    }

    if (trimmedName.length > 100) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Project name cannot exceed 100 characters.",
        data: null,
      });
      return;
    }

    // -------------------------------------------------
    // Team validation
    // -------------------------------------------------

    if (!teamId || typeof teamId !== "string") {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Team ID is required.",
        data: null,
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid team ID.",
        data: null,
      });
      return;
    }

    // -------------------------------------------------
    // Status validation
    // -------------------------------------------------

    const allowedStatuses: PROJECT_STATUS[] = [
      PROJECT_STATUS.PLANNING,
      PROJECT_STATUS.ACTIVE,
      PROJECT_STATUS.COMPLETED,
      PROJECT_STATUS.ARCHIVED,
    ];

    let projectStatus: PROJECT_STATUS = PROJECT_STATUS.PLANNING;

    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        !allowedStatuses.includes(status as PROJECT_STATUS)
      ) {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Invalid project status.",
          data: null,
        });
        return;
      }

      projectStatus = status as PROJECT_STATUS;
    }

    // -------------------------------------------------
    // Description validation
    // -------------------------------------------------

    if (description !== undefined && typeof description !== "string") {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Description must be a string.",
        data: null,
      });
      return;
    }

    if (typeof description === "string" && description.length > 500) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Description cannot exceed 500 characters.",
        data: null,
      });
      return;
    }

    // -------------------------------------------------
    // Date validation
    // -------------------------------------------------

    let parsedStartDate: Date | undefined;
    let parsedDueDate: Date | undefined;

    if (startDate !== undefined) {
      parsedStartDate = new Date(startDate);

      if (Number.isNaN(parsedStartDate.getTime())) {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Invalid start date.",
          data: null,
        });
        return;
      }
    }

    if (dueDate !== undefined) {
      parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Invalid due date.",
          data: null,
        });
        return;
      }
    }

    if (parsedStartDate && parsedDueDate && parsedDueDate < parsedStartDate) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Due date cannot be earlier than start date.",
        data: null,
      });
      return;
    }

    // -------------------------------------------------
    // Call SERVICE
    // -------------------------------------------------

    const project = await projectService.createProject(
      trimmedName,
      typeof description === "string" ? description.trim() : undefined,
      teamId,
      userId,
      userRole,
      projectStatus,
      parsedStartDate,
      parsedDueDate,
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// ADD PROJECT MEMBER
// =====================================================

export const handleAddProjectMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    const { projectId } = req.params;
    const { email } = req.body;

    // -------------------------------------------------
    // Authentication
    // -------------------------------------------------

    if (!requesterId || !requesterRole) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized.",
        data: null,
      });
      return;
    }

    // -------------------------------------------------
    // Project ID
    // -------------------------------------------------

    if (!projectId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Project ID is required.",
        data: null,
      });
      return;
    }

    // -------------------------------------------------
    // Email
    // -------------------------------------------------

    if (!email || typeof email !== "string") {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Email is required.",
        data: null,
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Email is required.",
        data: null,
      });
      return;
    }

    // -------------------------------------------------
    // Call SERVICE
    // -------------------------------------------------

    const project = await projectService.addProjectMember(
      projectId,
      normalizedEmail,
      requesterId,
      requesterRole,
    );

    res.status(200).json({
      success: true,
      message: "Project member added successfully.",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET PROJECTS
// =====================================================

export const getProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized.",
        data: null,
      });
      return;
    }

    // IMPORTANT:
    // Controller calls SERVICE here.
    const projects = await projectService.getUserProjects(userId, userRole);

    res.status(200).json({
      success: true,
      message: "Projects fetched successfully.",
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET SINGLE PROJECT
// =====================================================

export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { projectId } = req.params;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized.",
        data: null,
      });
      return;
    }

    if (!projectId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Project ID is required.",
        data: null,
      });
      return;
    }

    const project = await projectService.getProjectById(
      projectId,
      userId,
      userRole,
    );

    if (!project) {
      res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: "Project not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Project fetched successfully.",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE PROJECT
// =====================================================

export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { projectId } = req.params;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized.",
        data: null,
      });
      return;
    }

    if (!projectId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Project ID is required.",
        data: null,
      });
      return;
    }

    const { name, description, status, startDate, dueDate } = req.body;

    // -------------------------------------------------
    // At least one field
    // -------------------------------------------------

    if (
      name === undefined &&
      description === undefined &&
      status === undefined &&
      startDate === undefined &&
      dueDate === undefined
    ) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "At least one field is required to update the project.",
        data: null,
      });
      return;
    }

    // -------------------------------------------------
    // Name
    // -------------------------------------------------

    let trimmedName: string | undefined;

    if (name !== undefined) {
      if (typeof name !== "string") {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Project name must be a string.",
          data: null,
        });
        return;
      }

      trimmedName = name.trim();

      if (trimmedName.length < 3) {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Project name must be at least 3 characters long.",
          data: null,
        });
        return;
      }

      if (trimmedName.length > 100) {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Project name cannot exceed 100 characters.",
          data: null,
        });
        return;
      }
    }

    // -------------------------------------------------
    // Description
    // -------------------------------------------------

    if (description !== undefined && typeof description !== "string") {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Description must be a string.",
        data: null,
      });
      return;
    }

    if (typeof description === "string" && description.length > 500) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Description cannot exceed 500 characters.",
        data: null,
      });
      return;
    }

    // -------------------------------------------------
    // Status
    // -------------------------------------------------

    const allowedStatuses: PROJECT_STATUS[] = [
      PROJECT_STATUS.PLANNING,
      PROJECT_STATUS.ACTIVE,
      PROJECT_STATUS.COMPLETED,
      PROJECT_STATUS.ARCHIVED,
    ];

    let validatedStatus: PROJECT_STATUS | undefined;

    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        !allowedStatuses.includes(status as PROJECT_STATUS)
      ) {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Invalid project status.",
          data: null,
        });
        return;
      }

      validatedStatus = status as PROJECT_STATUS;
    }

    // -------------------------------------------------
    // Dates
    // -------------------------------------------------

    let parsedStartDate: Date | undefined;
    let parsedDueDate: Date | undefined;

    if (startDate !== undefined) {
      parsedStartDate = new Date(startDate);

      if (Number.isNaN(parsedStartDate.getTime())) {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Invalid start date.",
          data: null,
        });
        return;
      }
    }

    if (dueDate !== undefined) {
      parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Invalid due date.",
          data: null,
        });
        return;
      }
    }

    if (parsedStartDate && parsedDueDate && parsedDueDate < parsedStartDate) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Due date cannot be earlier than start date.",
        data: null,
      });
      return;
    }

    // -------------------------------------------------
    // Call SERVICE
    // -------------------------------------------------

    const project = await projectService.updateProject(
      projectId,
      userId,
      userRole,
      {
        name: trimmedName,
        description:
          typeof description === "string" ? description.trim() : description,
        status: validatedStatus,
        startDate: parsedStartDate,
        dueDate: parsedDueDate,
      },
    );

    if (!project) {
      res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: "Project not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// DELETE PROJECT
// =====================================================

export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const { projectId } = req.params;

    if (!userId || !userRole) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Unauthorized.",
        data: null,
      });
      return;
    }

    if (!projectId) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Project ID is required.",
        data: null,
      });
      return;
    }

    // IMPORTANT:
    // Call service here, NOT directly as route handler.
    await projectService.deleteProject(projectId, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
