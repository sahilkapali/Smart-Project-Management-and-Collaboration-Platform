import { Response } from "express";
import mongoose from "mongoose";

import { AuthRequest } from "../types/custom";
import Repository from "../models/repository.models";

import {
  createVersionService,
  getVersionsService,
  getVersionByIdService,
  deleteVersionService,
} from "../services/repositoryVersion.service";

import { uploadFileToCloudinary } from "../services/cloudinary.service";

// ======================================================
// CREATE REPOSITORY VERSION
// ======================================================

export const createVersion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const repositoryId = req.params.id;

    const { version, message } = req.body;

    // ==================================================
    // AUTHENTICATION
    // ==================================================

    if (!userId) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication required.",
        data: null,
      });
      return;
    }

    // ==================================================
    // REPOSITORY ID VALIDATION
    // ==================================================

    if (!repositoryId || !mongoose.Types.ObjectId.isValid(repositoryId)) {
      res.status(400).json({
        success: false,
        code: "INVALID_REPOSITORY_ID",
        message: "A valid repository ID is required.",
        data: null,
      });
      return;
    }

    // ==================================================
    // VERSION VALIDATION
    // ==================================================

    if (typeof version !== "string" || version.trim().length === 0) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Version is required.",
        data: null,
      });
      return;
    }

    if (version.trim().length > 50) {
      res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Version cannot exceed 50 characters.",
        data: null,
      });
      return;
    }

    // ==================================================
    // FILE VALIDATION
    // ==================================================

    if (!req.file) {
      res.status(400).json({
        success: false,
        code: "FILE_REQUIRED",
        message: "Repository version file is required.",
        data: null,
      });
      return;
    }

    // ==================================================
    // CHECK REPOSITORY
    // ==================================================

    const repository = await Repository.findById(repositoryId);

    if (!repository) {
      res.status(404).json({
        success: false,
        code: "REPOSITORY_NOT_FOUND",
        message: "Repository not found.",
        data: null,
      });
      return;
    }

    // ==================================================
    // UPLOAD FILE
    // ==================================================

    const fileUrl = await uploadFileToCloudinary(
      req.file.buffer,
      req.file.originalname,
    );

    // ==================================================
    // CREATE VERSION
    // ==================================================

    const repositoryVersion = await createVersionService({
      repository: repositoryId,
      version: version.trim(),
      message: typeof message === "string" ? message.trim() : "",
      file: fileUrl,
      uploadedBy: userId,
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(201).json({
      success: true,
      message: "Repository version created successfully.",
      data: repositoryVersion,
    });
  } catch (error: any) {
    console.error("Create repository version error:", error);

    res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: error?.message || "Failed to create repository version.",
      data: null,
    });
  }
};

// ======================================================
// GET ALL REPOSITORY VERSIONS
// ======================================================

export const getVersions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const repositoryId = req.params.id;

    // ==================================================
    // AUTHENTICATION
    // ==================================================

    if (!userId) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication required.",
        data: null,
      });
      return;
    }

    // ==================================================
    // REPOSITORY ID VALIDATION
    // ==================================================

    if (!repositoryId || !mongoose.Types.ObjectId.isValid(repositoryId)) {
      res.status(400).json({
        success: false,
        code: "INVALID_REPOSITORY_ID",
        message: "A valid repository ID is required.",
        data: null,
      });
      return;
    }

    // ==================================================
    // CHECK REPOSITORY
    // ==================================================

    const repository = await Repository.findById(repositoryId);

    if (!repository) {
      res.status(404).json({
        success: false,
        code: "REPOSITORY_NOT_FOUND",
        message: "Repository not found.",
        data: null,
      });
      return;
    }

    // ==================================================
    // GET VERSIONS
    // ==================================================

    const versions = await getVersionsService(repositoryId);

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(200).json({
      success: true,
      count: versions.length,
      data: versions,
    });
  } catch (error: any) {
    console.error("Get repository versions error:", error);

    res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: error?.message || "Failed to fetch repository versions.",
      data: null,
    });
  }
};

// ======================================================
// GET VERSION BY ID
// ======================================================

export const getVersionById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const versionId = req.params.versionId;

    // ==================================================
    // AUTHENTICATION
    // ==================================================

    if (!userId) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication required.",
        data: null,
      });
      return;
    }

    // ==================================================
    // VERSION ID VALIDATION
    // ==================================================

    if (!versionId || !mongoose.Types.ObjectId.isValid(versionId)) {
      res.status(400).json({
        success: false,
        code: "INVALID_VERSION_ID",
        message: "A valid version ID is required.",
        data: null,
      });
      return;
    }

    // ==================================================
    // GET VERSION
    // ==================================================

    const version = await getVersionByIdService(versionId);

    if (!version) {
      res.status(404).json({
        success: false,
        code: "VERSION_NOT_FOUND",
        message: "Repository version not found.",
        data: null,
      });
      return;
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(200).json({
      success: true,
      data: version,
    });
  } catch (error: any) {
    console.error("Get repository version error:", error);

    res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: error?.message || "Failed to fetch repository version.",
      data: null,
    });
  }
};

// ======================================================
// DELETE VERSION
// ======================================================

export const deleteVersion = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const versionId = req.params.versionId;

    // ==================================================
    // AUTHENTICATION
    // ==================================================

    if (!userId) {
      res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication required.",
        data: null,
      });
      return;
    }

    // ==================================================
    // VERSION ID VALIDATION
    // ==================================================

    if (!versionId || !mongoose.Types.ObjectId.isValid(versionId)) {
      res.status(400).json({
        success: false,
        code: "INVALID_VERSION_ID",
        message: "A valid version ID is required.",
        data: null,
      });
      return;
    }

    // ==================================================
    // DELETE VERSION
    // ==================================================

    const deletedVersion = await deleteVersionService(versionId);

    if (!deletedVersion) {
      res.status(404).json({
        success: false,
        code: "VERSION_NOT_FOUND",
        message: "Repository version not found.",
        data: null,
      });
      return;
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(200).json({
      success: true,
      message: "Repository version deleted successfully.",
      data: deletedVersion,
    });
  } catch (error: any) {
    console.error("Delete repository version error:", error);

    res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: error?.message || "Failed to delete repository version.",
      data: null,
    });
  }
};
