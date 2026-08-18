import { Response } from "express";
import mongoose from "mongoose";

import { AuthRequest } from "../types/custom";

import {
  createVersionService,
  getVersionsService,
  getVersionByIdService,
  deleteVersionService,
} from "../services/repositoryVersion.service";

import { uploadFileToCloudinary } from "../services/cloudinary.service";

const getParamString = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
};

export const createVersion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const repositoryId = getParamString(req.params.id);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
      res.status(400).json({
        success: false,
        message: "Invalid repository ID",
      });
      return;
    }

    const { versionNumber, title, changelog, commitHash } = req.body;

    if (typeof versionNumber !== "string" || !versionNumber.trim()) {
      res.status(400).json({
        success: false,
        message: "Version number is required",
      });
      return;
    }

    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({
        success: false,
        message: "Title is required",
      });
      return;
    }

    let fileUrl = "";

    if (req.file) {
      fileUrl = await uploadFileToCloudinary(
        req.file.buffer,
        req.file.originalname,
      );
    }

    const version = await createVersionService({
      repository: repositoryId,
      versionNumber: versionNumber.trim(),
      title: title.trim(),
      changelog: typeof changelog === "string" ? changelog.trim() : "",
      commitHash: typeof commitHash === "string" ? commitHash.trim() : "",
      file: fileUrl,
      uploadedBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Repository version created successfully",
      data: version,
    });
  } catch (error: any) {
    if (error.message === "REPOSITORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Repository not found",
      });
      return;
    }

    if (error.message === "VERSION_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        message: "Version already exists",
      });
      return;
    }

    if (error.message === "PROJECT_MANAGE_DENIED") {
      res.status(403).json({
        success: false,
        message: "Permission denied",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create repository version",
    });
  }
};

export const getVersions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const repositoryId = getParamString(req.params.id);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const versions = await getVersionsService(repositoryId, userId);

    res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error: any) {
    res.status(error.message === "REPOSITORY_NOT_FOUND" ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVersionById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const repositoryId = getParamString(req.params.id);
    const versionId = getParamString(req.params.versionId);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const version = await getVersionByIdService(
      repositoryId,
      versionId,
      userId,
    );

    if (!version) {
      res.status(404).json({
        success: false,
        message: "Version not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: version,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteVersion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const repositoryId = getParamString(req.params.id);
    const versionId = getParamString(req.params.versionId);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const deleted = await deleteVersionService(repositoryId, versionId, userId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Version not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Version deleted successfully",
      data: deleted,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
