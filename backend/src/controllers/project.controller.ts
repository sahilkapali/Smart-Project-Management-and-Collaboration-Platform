import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/custom";

import * as projectService from "../services/project.service";

import { PROJECT_STATUS } from "../types/project.types";

/**
 * =========================================================
 * CREATE PROJECT
 * =========================================================
 */
export const handleCreateProject = async (
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

    /**
     * Validate project name.
     */
    if (!name || typeof name !== "string") {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Project name is required and must be a string.",
        data: null,
      });
      return;
    }

    /**
     * Validate team ID.
     */
    if (!teamId || typeof teamId !== "string") {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Team ID is required.",
        data: null,
      });
      return;
    }

    /**
     * Validate status.
     */
    const projectStatus: PROJECT_STATUS = status || "PLANNING";

    const allowedStatuses: PROJECT_STATUS[] = [
      "PLANNING",
      "ACTIVE",
      "COMPLETED",
      "ARCHIVED",
    ];

    if (!allowedStatuses.includes(projectStatus)) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid project status.",
        data: null,
      });
      return;
    }

    /**
     * Convert dates.
     */
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

    const project = await projectService.createProject(
      name.trim(),
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

/**
 * =========================================================
 * GET CURRENT USER PROJECTS
 * =========================================================
 */
export const handleGetProjects = async (
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

/**
 * =========================================================
 * GET SINGLE PROJECT
 * =========================================================
 */
export const handleGetProjectById = async (
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

    res.status(200).json({
      success: true,
      message: "Project fetched successfully.",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * UPDATE PROJECT
 * =========================================================
 */
export const handleUpdateProject = async (
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

    /**
     * Make sure at least one field is supplied.
     */
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

    /**
     * Validate name.
     */
    if (name !== undefined && typeof name !== "string") {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Project name must be a string.",
        data: null,
      });
      return;
    }

    if (typeof name === "string") {
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
    }

    /**
     * Validate description.
     */
    if (description !== undefined && typeof description !== "string") {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Description must be a string.",
        data: null,
      });
      return;
    }

    /**
     * Validate status.
     */
    const allowedStatuses: PROJECT_STATUS[] = [
      "PLANNING",
      "ACTIVE",
      "COMPLETED",
      "ARCHIVED",
    ];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid project status.",
        data: null,
      });
      return;
    }

    /**
     * Parse dates.
     */
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

    const project = await projectService.updateProject(
      projectId,
      userId,
      userRole,
      {
        name,
        description,
        status,
        startDate: parsedStartDate,
        dueDate: parsedDueDate,
      },
    );

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * DELETE PROJECT
 * =========================================================
 */
export const handleDeleteProject = async (
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
