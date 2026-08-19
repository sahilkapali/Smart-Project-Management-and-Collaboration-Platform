import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import * as repositoryFileService from "../services/repositoryFile.service";

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
// CREATE FILE OR FOLDER
// =====================================================

export const createFileOrFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const { 
      repository, 
      version, 
      name, 
      path, 
      type, 
      size, 
      mimeType, 
      url, 
      content, 
      isBinary 
    } = req.body ?? {};

    if (typeof repository !== "string" || !mongoose.Types.ObjectId.isValid(repository.trim())) {
      return res.status(400).json({ success: false, message: "Valid Repository ID is required." });
    }

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "File or folder name is required." });
    }

    if (typeof path !== "string" || !path.trim()) {
      return res.status(400).json({ success: false, message: "File path is required." });
    }

    const file = await repositoryFileService.createFileOrFolderService(
      {
        repository: repository.trim(),
        version: typeof version === "string" ? version.trim() : undefined,
        name: name.trim(),
        path: path.trim(),
        type: type === "folder" ? "folder" : "file",
        size: typeof size === "number" ? size : undefined,
        mimeType: typeof mimeType === "string" ? mimeType.trim() : undefined,
        url: typeof url === "string" ? url.trim() : undefined,
        content: typeof content === "string" ? content : undefined,
        isBinary: typeof isBinary === "boolean" ? isBinary : undefined,
      },
      userId
    );

    return res.status(201).json({
      success: true,
      message: `${type === "folder" ? "Folder" : "File"} created successfully.`,
      data: file,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "REPOSITORY_NOT_FOUND":
        return res.status(404).json({ success: false, message: "Repository not found." });
      case "PROJECT_ACCESS_DENIED":
      case "PROJECT_MANAGE_DENIED":
        return res.status(403).json({ success: false, message: "Permission denied to manage files in this repository." });
      case "INVALID_VERSION_ID":
        return res.status(400).json({ success: false, message: "Invalid Version ID provided." });
      case "FILE_PATH_ALREADY_EXISTS":
        return res.status(409).json({ success: false, message: "A file or folder with this exact path already exists in this version." });
      default:
        return next(error);
    }
  }
};

// =====================================================
// GET FILES BY REPOSITORY
// =====================================================

export const getRepositoryFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const repositoryId = getParamString(req.params.repositoryId);
    const versionId = getParamString(req.query.versionId); // Optional filter

    if (!repositoryId || !mongoose.Types.ObjectId.isValid(repositoryId)) {
      return res.status(400).json({ success: false, message: "Valid Repository ID is required." });
    }

    const files = await repositoryFileService.getRepositoryFilesService(
      repositoryId, 
      userId, 
      versionId || undefined
    );

    return res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "REPOSITORY_NOT_FOUND":
        return res.status(404).json({ success: false, message: "Repository not found." });
      case "PROJECT_ACCESS_DENIED":
        return res.status(403).json({ success: false, message: "You do not have access to this repository." });
      case "INVALID_VERSION_ID":
        return res.status(400).json({ success: false, message: "Invalid Version ID provided." });
      default:
        return next(error);
    }
  }
};

// =====================================================
// GET FILE BY ID
// =====================================================

export const getFileById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const fileId = getParamString(req.params.id);

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ success: false, message: "Valid File ID is required." });
    }

    const file = await repositoryFileService.getFileByIdService(fileId, userId);

    return res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "FILE_NOT_FOUND":
        return res.status(404).json({ success: false, message: "File not found." });
      case "PROJECT_ACCESS_DENIED":
        return res.status(403).json({ success: false, message: "You do not have access to this file." });
      default:
        return next(error);
    }
  }
};

// =====================================================
// UPDATE FILE
// =====================================================

export const updateFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const fileId = getParamString(req.params.id);

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ success: false, message: "Valid File ID is required." });
    }

    const { name, path, content, url, size, isBinary } = req.body ?? {};

    const updatedFile = await repositoryFileService.updateFileService(
      fileId,
      {
        ...(name !== undefined && { name: typeof name === "string" ? name.trim() : "" }),
        ...(path !== undefined && { path: typeof path === "string" ? path.trim() : "" }),
        ...(content !== undefined && { content: typeof content === "string" ? content : "" }),
        ...(url !== undefined && { url: typeof url === "string" ? url.trim() : "" }),
        ...(size !== undefined && { size: typeof size === "number" ? size : 0 }),
        ...(isBinary !== undefined && { isBinary: typeof isBinary === "boolean" ? isBinary : false }),
      },
      userId
    );

    return res.status(200).json({
      success: true,
      message: "File updated successfully.",
      data: updatedFile,
    });
  } catch (error: any) {
    switch (error?.message) {
      case "FILE_NOT_FOUND":
        return res.status(404).json({ success: false, message: "File not found." });
      case "FILE_NAME_REQUIRED":
        return res.status(400).json({ success: false, message: "File name is required." });
      case "FILE_PATH_REQUIRED":
        return res.status(400).json({ success: false, message: "File path is required." });
      case "FILE_PATH_ALREADY_EXISTS":
        return res.status(409).json({ success: false, message: "Another file with this exact path already exists in this version." });
      case "PROJECT_ACCESS_DENIED":
      case "PROJECT_MANAGE_DENIED":
        return res.status(403).json({ success: false, message: "Permission denied to update this file." });
      default:
        return next(error);
    }
  }
};

// =====================================================
// DELETE FILE
// =====================================================

export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const fileId = getParamString(req.params.id);

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ success: false, message: "Valid File ID is required." });
    }

    await repositoryFileService.deleteFileService(fileId, userId);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully.",
    });
  } catch (error: any) {
    switch (error?.message) {
      case "FILE_NOT_FOUND":
        return res.status(404).json({ success: false, message: "File not found." });
      case "PROJECT_ACCESS_DENIED":
      case "PROJECT_MANAGE_DENIED":
        return res.status(403).json({ success: false, message: "Permission denied to delete this file." });
      default:
        return next(error);
    }
  }
};