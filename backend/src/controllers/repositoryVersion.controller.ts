import { Response } from "express";
import { AuthRequest } from "../types/custom";
import Repository from "../models/repository.models";

import {
  createVersionService,
  getVersionsService,
  getVersionByIdService,
  deleteVersionService,
} from "../services/repositoryVersion.service";

// Create Repository Version
export const createVersion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { version, message, file } = req.body;

    // Convert route parameter to string
    const repositoryId = String(req.params.id);

    // Validation
    if (!repositoryId || repositoryId === "undefined") {
      res.status(400).json({
        success: false,
        message: "Repository ID is required.",
      });
      return;
    }

    if (!version) {
      res.status(400).json({
        success: false,
        message: "Version is required.",
      });
      return;
    }

    // Check repository
    const repository = await Repository.findById(repositoryId);

    if (!repository) {
      res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
      return;
    }

    // Create repository version
    const repositoryVersion = await createVersionService({
      repository: repositoryId,
      version,
      message,
      file,
      uploadedBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Repository version created successfully.",
      data: repositoryVersion,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All Versions
export const getVersions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Convert route parameter to string
    const repositoryId = String(req.params.id);

    if (!repositoryId || repositoryId === "undefined") {
      res.status(400).json({
        success: false,
        message: "Repository ID is required.",
      });
      return;
    }

    // Check repository
    const repository = await Repository.findById(repositoryId);

    if (!repository) {
      res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
      return;
    }

    const versions = await getVersionsService(repositoryId);

    res.status(200).json({
      success: true,
      count: versions.length,
      data: versions,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Version By ID
export const getVersionById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Convert route parameter to string
    const versionId = String(req.params.versionId);

    if (!versionId || versionId === "undefined") {
      res.status(400).json({
        success: false,
        message: "Version ID is required.",
      });
      return;
    }

    const version = await getVersionByIdService(versionId);

    if (!version) {
      res.status(404).json({
        success: false,
        message: "Repository version not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: version,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete Version
export const deleteVersion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Convert route parameter to string
    const versionId = String(req.params.versionId);

    if (!versionId || versionId === "undefined") {
      res.status(400).json({
        success: false,
        message: "Version ID is required.",
      });
      return;
    }

    const version = await deleteVersionService(versionId);

    if (!version) {
      res.status(404).json({
        success: false,
        message: "Repository version not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Repository version deleted successfully.",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};