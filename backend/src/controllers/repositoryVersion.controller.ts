import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import * as repositoryVersionService from "../services/repositoryVersion.service";

// =====================================================
// PARAMETER HELPER
// =====================================================

const getParamString = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }
  return "";
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
// CREATE REPOSITORY VERSION
// =====================================================

export const createVersion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    
    const repositoryId = getParamString(req.params.id) || getParamString(req.body?.repository);
    const { versionNumber, title, changelog, commitHash } = req.body ?? {};

    if (!repositoryId || !mongoose.Types.ObjectId.isValid(repositoryId.trim())) {
      return res.status(400).json({ success: false, message: "Valid Repository ID is required." });
    }

    if (typeof versionNumber !== "string" || !versionNumber.trim()) {
      return res.status(400).json({ success: false, message: "Version number is required." });
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, message: "Version title is required." });
    }

    const fileFile = req.file as any;
    const archiveUrl = fileFile?.path || fileFile?.secure_url || req.body?.archiveUrl || "";

    const version = await repositoryVersionService.createVersionService({
      repository: repositoryId.trim(),
      versionNumber: versionNumber.trim(),
      title: title.trim(),
      changelog: typeof changelog === "string" ? changelog.trim() : undefined,
      commitHash: typeof commitHash === "string" ? commitHash.trim() : undefined,
      archiveUrl: typeof archiveUrl === "string" ? archiveUrl.trim() : undefined,
      uploadedBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Version created successfully.",
      data: version,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "REPOSITORY_NOT_FOUND":
        return res.status(404).json({ success: false, message: "Repository not found." });
      case "PROJECT_ACCESS_DENIED":
      case "PROJECT_MANAGE_DENIED":
        return res.status(403).json({ success: false, message: "Permission denied to manage versions in this repository." });
      case "VERSION_NUMBER_ALREADY_EXISTS":
        return res.status(409).json({ success: false, message: "This version number already exists for this repository." });
      default:
        return next(error);
    }
  }
};

// =====================================================
// GET VERSIONS BY REPOSITORY
// =====================================================

export const getVersions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const repositoryId = getParamString(req.params.id) || getParamString(req.params.repositoryId);

    if (!repositoryId || !mongoose.Types.ObjectId.isValid(repositoryId)) {
      return res.status(400).json({ success: false, message: "Valid Repository ID is required." });
    }

    const versions = await repositoryVersionService.getVersionsService(repositoryId, userId);

    return res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "REPOSITORY_NOT_FOUND":
        return res.status(404).json({ success: false, message: "Repository not found." });
      case "PROJECT_ACCESS_DENIED":
        return res.status(403).json({ success: false, message: "You do not have access to this repository." });
      default:
        return next(error);
    }
  }
};

// =====================================================
// GET VERSION BY ID
// =====================================================

export const getVersionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    // Check req.params.versionId (nested) or req.params.id
    const versionId = getParamString(req.params.versionId) || getParamString(req.params.id);

    if (!versionId || !mongoose.Types.ObjectId.isValid(versionId)) {
      return res.status(400).json({ success: false, message: "Valid Version ID is required." });
    }

    const version = await repositoryVersionService.getVersionByIdService(versionId, userId);

    return res.status(200).json({
      success: true,
      data: version,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "VERSION_NOT_FOUND":
        return res.status(404).json({ success: false, message: "Version not found." });
      case "PROJECT_ACCESS_DENIED":
        return res.status(403).json({ success: false, message: "You do not have access to this version." });
      default:
        return next(error);
    }
  }
};

// =====================================================
// DELETE VERSION
// =====================================================

export const deleteVersion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    // Check req.params.versionId (nested) or req.params.id
    const versionId = getParamString(req.params.versionId) || getParamString(req.params.id);

    if (!versionId || !mongoose.Types.ObjectId.isValid(versionId)) {
      return res.status(400).json({ success: false, message: "Valid Version ID is required." });
    }

    await repositoryVersionService.deleteVersionService(versionId, userId);

    return res.status(200).json({
      success: true,
      message: "Version deleted successfully.",
    });
  } catch (error: any) {
    switch (error?.message) {
      case "VERSION_NOT_FOUND":
        return res.status(404).json({ success: false, message: "Version not found." });
      case "PROJECT_ACCESS_DENIED":
      case "PROJECT_MANAGE_DENIED":
        return res.status(403).json({ success: false, message: "Permission denied to delete this version." });
      default:
        return next(error);
    }
  }
};