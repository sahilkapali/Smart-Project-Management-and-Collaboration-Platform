import { Response } from "express";
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
  res: Response
): Promise<void> => {
  try {
    const { version, message } = req.body;

    const repositoryId = String(req.params.id);

    // ------------------------------------------
    // Authentication check
    // ------------------------------------------

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });

      return;
    }

    // ------------------------------------------
    // Repository ID validation
    // ------------------------------------------

    if (!repositoryId || repositoryId === "undefined") {
      res.status(400).json({
        success: false,
        message: "Repository ID is required.",
      });

      return;
    }

    // ------------------------------------------
    // Version validation
    // ------------------------------------------

    if (
      !version ||
      typeof version !== "string" ||
      version.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Version is required.",
      });

      return;
    }

    // ------------------------------------------
    // File validation
    // ------------------------------------------

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Repository version file is required.",
      });

      return;
    }

    // ------------------------------------------
    // Check repository
    // ------------------------------------------

    const repository = await Repository.findById(repositoryId);

    if (!repository) {
      res.status(404).json({
        success: false,
        message: "Repository not found.",
      });

      return;
    }

    // ------------------------------------------
    // Upload file to Cloudinary
    // ------------------------------------------

    const fileUrl = await uploadFileToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    // ------------------------------------------
    // Save version in MongoDB
    // ------------------------------------------

    const repositoryVersion = await createVersionService({
      repository: repositoryId,

      version: version.trim(),

      message:
        typeof message === "string"
          ? message.trim()
          : "",

      file: fileUrl,

      uploadedBy: req.user.id,
    });

    // ------------------------------------------
    // Response
    // ------------------------------------------

    res.status(201).json({
      success: true,
      message: "Repository version created successfully.",

      data: repositoryVersion,
    });
  } catch (err: any) {
    console.error("Create repository version error:", err);

    res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to create repository version.",
    });
  }
};

// ======================================================
// GET ALL VERSIONS
// ======================================================

export const getVersions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const repositoryId = String(req.params.id);

    // ------------------------------------------
    // Validate repository ID
    // ------------------------------------------

    if (!repositoryId || repositoryId === "undefined") {
      res.status(400).json({
        success: false,
        message: "Repository ID is required.",
      });

      return;
    }

    // ------------------------------------------
    // Check repository
    // ------------------------------------------

    const repository = await Repository.findById(repositoryId);

    if (!repository) {
      res.status(404).json({
        success: false,
        message: "Repository not found.",
      });

      return;
    }

    // ------------------------------------------
    // Get versions
    // ------------------------------------------

    const versions =
      await getVersionsService(repositoryId);

    res.status(200).json({
      success: true,
      count: versions.length,
      data: versions,
    });
  } catch (err: any) {
    console.error("Get repository versions error:", err);

    res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch repository versions.",
    });
  }
};

// ======================================================
// GET VERSION BY ID
// ======================================================

export const getVersionById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const versionId = String(req.params.versionId);

    // ------------------------------------------
    // Validate version ID
    // ------------------------------------------

    if (!versionId || versionId === "undefined") {
      res.status(400).json({
        success: false,
        message: "Version ID is required.",
      });

      return;
    }

    // ------------------------------------------
    // Get version
    // ------------------------------------------

    const version =
      await getVersionByIdService(versionId);

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
    console.error("Get repository version error:", err);

    res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch repository version.",
    });
  }
};

// ======================================================
// DELETE VERSION
// ======================================================

export const deleteVersion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const versionId = String(req.params.versionId);

    // ------------------------------------------
    // Validate version ID
    // ------------------------------------------

    if (!versionId || versionId === "undefined") {
      res.status(400).json({
        success: false,
        message: "Version ID is required.",
      });

      return;
    }

    // ------------------------------------------
    // Delete version
    // ------------------------------------------

    const version =
      await deleteVersionService(versionId);

    if (!version) {
      res.status(404).json({
        success: false,
        message: "Repository version not found.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message:
        "Repository version deleted successfully.",
    });
  } catch (err: any) {
    console.error("Delete repository version error:", err);

    res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to delete repository version.",
    });
  }
};