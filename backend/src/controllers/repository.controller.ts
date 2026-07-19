import { Response } from "express";
import Repository from "../models/repository.models";
import RepositoryVersion from "../models/repositoryVersion.models";
import { AuthRequest } from "../types/custom";

// Create Repository
export const createRepository = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { project, name, description, githubUrl } = req.body;

    const repository = new Repository({
      project,
      name,
      description,
      githubUrl,
      createdBy: req.user?.id,
    });

    const savedRepository = await repository.save();

    res.status(201).json(savedRepository);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Repositories
export const getRepositories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const repositories = await Repository.find()
      .populate("project")
      .populate("createdBy");

    res.status(200).json(repositories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get Repository By ID
export const getRepositoryById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const repository = await Repository.findById(req.params.id)
      .populate("project")
      .populate("createdBy");

    if (!repository) {
      res.status(404).json({
        message: "Repository not found",
      });
      return;
    }

    res.status(200).json(repository);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update Repository
export const updateRepository = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const repository = await Repository.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!repository) {
      res.status(404).json({
        message: "Repository not found",
      });
      return;
    }

    res.status(200).json(repository);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Repository
export const deleteRepository = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const repository = await Repository.findByIdAndDelete(req.params.id);

    if (!repository) {
      res.status(404).json({
        message: "Repository not found",
      });
      return;
    }

    res.status(200).json({
      message: "Repository deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Create Repository Version
export const createVersion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const repository = req.params.id;
    const { version, message } = req.body;

    const uploadedFile =
      req.file?.filename || req.file?.originalname || "";

    const repositoryVersion = new RepositoryVersion({
      repository,
      version,
      message,
      file: uploadedFile,
      uploadedBy: req.user?.id,
    });

    const savedVersion = await repositoryVersion.save();

    res.status(201).json(savedVersion);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get Repository Version History
export const getVersions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const versions = await RepositoryVersion.find({
      repository: req.params.id,
    })
      .populate("uploadedBy")
      .sort({ createdAt: -1 });

    res.status(200).json(versions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};