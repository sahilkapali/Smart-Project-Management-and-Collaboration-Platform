import {
  Request,
  Response,
  NextFunction
} from 'express';

import * as repositoryService
  from '../services/repository.service';


// =====================================================
// CREATE REPOSITORY
// =====================================================

export const createRepository = async (
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

    const {
      project,
      name,
      description,
      githubUrl
    } = req.body;

    if (!project) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Repository name is required'
      });
    }

    const repository =
      await repositoryService.createRepositoryService(
        {
          project,
          name,
          description,
          githubUrl
        },
        userId
      );

    return res.status(201).json({
      success: true,
      message:
        'Repository created successfully',
      data: repository
    });

  } catch (error: any) {

    if (
      error.message ===
      'PROJECT_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (
      error.message ===
      'PROJECT_MANAGE_DENIED'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to create repositories in this project'
      });
    }

    if (
      error.message ===
      'USER_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    next(error);
  }
};


// =====================================================
// GET ALL ACCESSIBLE REPOSITORIES
// =====================================================

export const getRepositories = async (
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

    const repositories =
      await repositoryService
        .getRepositoriesService(userId);

    return res.status(200).json({
      success: true,
      data: repositories
    });

  } catch (error: any) {

    if (
      error.message ===
      'USER_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    next(error);
  }
};


// =====================================================
// GET REPOSITORIES BY PROJECT
// =====================================================

export const getProjectRepositories = async (
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
      req.params.projectId as string;

    const repositories =
      await repositoryService
        .getProjectRepositoriesService(
          projectId,
          userId
        );

    return res.status(200).json({
      success: true,
      data: repositories
    });

  } catch (error: any) {

    if (
      error.message ===
      'PROJECT_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (
      error.message ===
      'PROJECT_ACCESS_DENIED'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have access to this project'
      });
    }

    next(error);
  }
};


// =====================================================
// GET REPOSITORY BY ID
// =====================================================

export const getRepositoryById = async (
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

    const repositoryId =
      req.params.id as string;

    const repository =
      await repositoryService
        .getRepositoryByIdService(
          repositoryId,
          userId
        );

    return res.status(200).json({
      success: true,
      data: repository
    });

  } catch (error: any) {

    if (
      error.message ===
      'REPOSITORY_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    if (
      error.message ===
      'PROJECT_ACCESS_DENIED'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have access to this repository'
      });
    }

    next(error);
  }
};


// =====================================================
// UPDATE REPOSITORY
// =====================================================

export const updateRepository = async (
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

    const repositoryId =
      req.params.id as string;

    const {
      name,
      description,
      githubUrl
    } = req.body;

    const repository =
      await repositoryService
        .updateRepositoryService(
          repositoryId,
          {
            name,
            description,
            githubUrl
          },
          userId
        );

    return res.status(200).json({
      success: true,
      message:
        'Repository updated successfully',
      data: repository
    });

  } catch (error: any) {

    if (
      error.message ===
      'REPOSITORY_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    if (
      error.message ===
      'PROJECT_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (
      error.message ===
      'PROJECT_MANAGE_DENIED'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to update this repository'
      });
    }

    next(error);
  }
};


// =====================================================
// DELETE REPOSITORY
// =====================================================

export const deleteRepository = async (
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

    const repositoryId =
      req.params.id as string;

    await repositoryService
      .deleteRepositoryService(
        repositoryId,
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        'Repository deleted successfully'
    });

  } catch (error: any) {

    if (
      error.message ===
      'REPOSITORY_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    if (
      error.message ===
      'PROJECT_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (
      error.message ===
      'PROJECT_MANAGE_DENIED'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to delete this repository'
      });
    }

    next(error);
  }
};