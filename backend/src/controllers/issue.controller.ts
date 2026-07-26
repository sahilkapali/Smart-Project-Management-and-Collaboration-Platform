import { Response } from "express";
import { AuthRequest } from "../types/custom";

import {
  createIssueService,
  getIssuesService,
  getIssueByIdService,
  updateIssueService,
  deleteIssueService,
} from "../services/issue.service";

// Create Issue
export const createIssue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      repository,
      title,
      description,
      priority,
      assignedTo,
    } = req.body;

    // Validation
    if (!repository || !title) {
      res.status(400).json({
        success: false,
        message: "Repository and Issue title are required.",
      });
      return;
    }

    const issue = await createIssueService({
      repository,
      title,
      description,
      priority,
      assignedTo,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully.",
      data: issue,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All Issues
export const getIssues = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const issues = await getIssuesService();

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Issue By ID
export const getIssueById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const issue = await getIssueByIdService(req.params.id);

    if (!issue) {
      res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update Issue
export const updateIssue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
    } = req.body;

    // Validation
    if (!title) {
      res.status(400).json({
        success: false,
        message: "Issue title is required.",
      });
      return;
    }

    const issue = await updateIssueService(req.params.id, {
      title,
      description,
      status,
      priority,
      assignedTo,
    });

    if (!issue) {
      res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Issue updated successfully.",
      data: issue,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete Issue
export const deleteIssue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const issue = await deleteIssueService(req.params.id);

    if (!issue) {
      res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully.",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};