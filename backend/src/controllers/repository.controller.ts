import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import * as repositoryService from "../services/repository.service";

// =====================================================
// PARAMETER HELPER
// =====================================================

const getParamString = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
};

// =====================================================
// AUTHENTICATION HELPER
// =====================================================

const getAuthenticatedUserId = (req: Request): string | null => {
  const userId = req.user?.id;

  if (!userId || typeof userId !== "string") {
    return null;
  }

  return userId;
};

// =====================================================
// CREATE REPOSITORY
// =====================================================

export const createRepository = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const { project, name, description, githubUrl } = req.body ?? {};

    // ---------------------------------------------------
    // PROJECT VALIDATION
    // ---------------------------------------------------

    if (typeof project !== "string" || !project.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    const projectId = project.trim();

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    // ---------------------------------------------------
    // NAME VALIDATION
    // ---------------------------------------------------

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Repository name is required.",
      });
    }

    const repositoryName = name.trim();

    if (repositoryName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Repository name cannot exceed 100 characters.",
      });
    }

    // ---------------------------------------------------
    // DESCRIPTION VALIDATION
    // ---------------------------------------------------

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Repository description must be a string.",
      });
    }

    // ---------------------------------------------------
    // GITHUB URL VALIDATION
    // ---------------------------------------------------

    if (
      githubUrl !== undefined &&
      githubUrl !== null &&
      typeof githubUrl !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "GitHub URL must be a string.",
      });
    }

    const repository = await repositoryService.createRepositoryService(
      {
        project: projectId,
        name: repositoryName,
        description:
          typeof description === "string" ? description.trim() : undefined,
        githubUrl: typeof githubUrl === "string" ? githubUrl.trim() : undefined,
      },
      userId,
    );

    return res.status(201).json({
      success: true,
      message: "Repository created successfully.",
      data: repository,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "PROJECT_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });

      case "PROJECT_ACCESS_DENIED":
      case "PROJECT_MANAGE_DENIED":
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to create a repository in this project.",
        });

      case "USER_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });

      case "PROJECT_ID_REQUIRED":
        return res.status(400).json({
          success: false,
          message: "Project ID is required.",
        });

      case "INVALID_PROJECT_ID":
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });

      case "REPOSITORY_NAME_REQUIRED":
        return res.status(400).json({
          success: false,
          message: "Repository name is required.",
        });

      case "REPOSITORY_NAME_ALREADY_EXISTS":
        return res.status(409).json({
          success: false,
          message:
            "A repository with this name already exists in this project.",
        });

      default:
        return next(error);
    }
  }
};

// =====================================================
// GET ALL ACCESSIBLE REPOSITORIES
// =====================================================

export const getRepositories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const repositories = await repositoryService.getRepositoriesService(userId);

    return res.status(200).json({
      success: true,
      data: repositories,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "USER_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });

      case "INVALID_USER_ID":
        return res.status(400).json({
          success: false,
          message: "Invalid user ID.",
        });

      default:
        return next(error);
    }
  }
};

// =====================================================
// GET REPOSITORIES BY PROJECT
// =====================================================

export const getProjectRepositories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const projectId = getParamString(req.params.projectId);

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const repositories = await repositoryService.getProjectRepositoriesService(
      projectId,
      userId,
    );

    return res.status(200).json({
      success: true,
      data: repositories,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "PROJECT_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });

      case "PROJECT_ACCESS_DENIED":
        return res.status(403).json({
          success: false,
          message: "You do not have access to this project.",
        });

      case "USER_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });

      case "INVALID_PROJECT_ID":
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });

      default:
        return next(error);
    }
  }
};

// =====================================================
// GET REPOSITORY BY ID
// =====================================================

export const getRepositoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const repositoryId = getParamString(req.params.id);

    if (!repositoryId) {
      return res.status(400).json({
        success: false,
        message: "Repository ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid repository ID.",
      });
    }

    const repository = await repositoryService.getRepositoryByIdService(
      repositoryId,
      userId,
    );

    return res.status(200).json({
      success: true,
      data: repository,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "REPOSITORY_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Repository not found.",
        });

      case "PROJECT_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });

      case "PROJECT_ACCESS_DENIED":
        return res.status(403).json({
          success: false,
          message: "You do not have access to this repository.",
        });

      case "USER_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });

      case "INVALID_REPOSITORY_ID":
        return res.status(400).json({
          success: false,
          message: "Invalid repository ID.",
        });

      default:
        return next(error);
    }
  }
};

// =====================================================
// UPDATE REPOSITORY
// =====================================================

export const updateRepository = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const repositoryId = getParamString(req.params.id);

    if (!repositoryId) {
      return res.status(400).json({
        success: false,
        message: "Repository ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid repository ID.",
      });
    }

    const { name, description, githubUrl } = req.body ?? {};

    // ---------------------------------------------------
    // NAME
    // ---------------------------------------------------

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Repository name must be a non-empty string.",
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Repository name cannot exceed 100 characters.",
        });
      }
    }

    // ---------------------------------------------------
    // DESCRIPTION
    // ---------------------------------------------------

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Repository description must be a string.",
      });
    }

    // ---------------------------------------------------
    // GITHUB URL
    // ---------------------------------------------------

    if (
      githubUrl !== undefined &&
      githubUrl !== null &&
      typeof githubUrl !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "GitHub URL must be a string.",
      });
    }

    const repository = await repositoryService.updateRepositoryService(
      repositoryId,
      {
        ...(name !== undefined && {
          name: name.trim(),
        }),

        ...(description !== undefined && {
          description:
            typeof description === "string" ? description.trim() : "",
        }),

        ...(githubUrl !== undefined && {
          githubUrl: typeof githubUrl === "string" ? githubUrl.trim() : "",
        }),
      },
      userId,
    );

    return res.status(200).json({
      success: true,
      message: "Repository updated successfully.",
      data: repository,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "REPOSITORY_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Repository not found.",
        });

      case "PROJECT_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });

      case "PROJECT_MANAGE_DENIED":
      case "PROJECT_ACCESS_DENIED":
        return res.status(403).json({
          success: false,
          message: "You do not have permission to update this repository.",
        });

      case "USER_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });

      case "INVALID_REPOSITORY_ID":
        return res.status(400).json({
          success: false,
          message: "Invalid repository ID.",
        });

      case "REPOSITORY_NAME_REQUIRED":
        return res.status(400).json({
          success: false,
          message: "Repository name is required.",
        });

      case "REPOSITORY_NAME_ALREADY_EXISTS":
        return res.status(409).json({
          success: false,
          message:
            "A repository with this name already exists in this project.",
        });

      default:
        return next(error);
    }
  }
};

// =====================================================
// DELETE REPOSITORY
// =====================================================

export const deleteRepository = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const repositoryId = getParamString(req.params.id);

    if (!repositoryId) {
      return res.status(400).json({
        success: false,
        message: "Repository ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid repository ID.",
      });
    }

    await repositoryService.deleteRepositoryService(repositoryId, userId);

    return res.status(200).json({
      success: true,
      message: "Repository deleted successfully.",
    });
  } catch (error: any) {
    switch (error?.message) {
      case "REPOSITORY_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Repository not found.",
        });

      case "PROJECT_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });

      case "PROJECT_MANAGE_DENIED":
      case "PROJECT_ACCESS_DENIED":
        return res.status(403).json({
          success: false,
          message: "You do not have permission to delete this repository.",
        });

      case "USER_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });

      case "INVALID_REPOSITORY_ID":
        return res.status(400).json({
          success: false,
          message: "Invalid repository ID.",
        });

      default:
        return next(error);
    }
  }
};
