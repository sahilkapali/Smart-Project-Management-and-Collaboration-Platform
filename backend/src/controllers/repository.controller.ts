import { Response } from "express";
import { AuthRequest } from "../types/custom";

import {
  createRepositoryService,
  getRepositoriesService,
  getRepositoryByIdService,
  updateRepositoryService,
  deleteRepositoryService,
} from "../services/repository.service";


export const createRepository = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { project, name, description, githubUrl } = req.body;

    if (!project || !name) {
      res.status(400).json({
        success: false,
        message: "Project and Repository name are required.",
      });
      return;
    }

    const repository = await createRepositoryService({
      project,
      name,
      description,
      githubUrl,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Repository created successfully.",
      data: repository,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const getRepositories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const repositories = await getRepositoriesService();

    res.status(200).json({
      success: true,
      count: repositories.length,
      data: repositories,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const getRepositoryById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    
    const repository = await getRepositoryByIdService(req.params.id as string);

    if (!repository) {
      res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: repository,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const updateRepository = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, githubUrl } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: "Repository name is required.",
      });
      return;
    }

    
    const repository = await updateRepositoryService(req.params.id as string, {
      name,
      description,
      githubUrl,
    });

    if (!repository) {
      res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Repository updated successfully.",
      data: repository,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const deleteRepository = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const repository = await deleteRepositoryService(req.params.id as string);

    if (!repository) {
      res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Repository deleted successfully.",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};