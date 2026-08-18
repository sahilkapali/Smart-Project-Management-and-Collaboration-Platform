import { Response } from "express";
import mongoose from "mongoose";

import { AuthRequest } from "../types/custom";

import Issue from "../models/issue.models";
import IssueComment from "../models/issueComment.models";

import {
  createIssueService,
  getIssuesService,
  getIssueByIdService,
  updateIssueService,
  deleteIssueService
} from "../services/issue.service";

import { ROLE } from "../types/enum.types";

// ============================================================
// CREATE ISSUE
// ============================================================

export const createIssue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { repository, title, description, priority, assignedTo } = req.body;

    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    // --------------------------------------------------------
    // Repository validation
    // --------------------------------------------------------

    if (!repository) {
      res.status(400).json({
        success: false,
        message: "Repository is required.",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(repository)) {
      res.status(400).json({
        success: false,
        message: "Invalid repository ID.",
      });
      return;
    }

    // --------------------------------------------------------
    // Title validation
    // --------------------------------------------------------

    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({
        success: false,
        message: "Issue title is required.",
      });
      return;
    }

    const cleanTitle = title.trim();

    if (cleanTitle.length < 3) {
      res.status(400).json({
        success: false,
        message: "Issue title must be at least 3 characters.",
      });
      return;
    }

    // --------------------------------------------------------
    // Assigned user validation
    // --------------------------------------------------------

    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      res.status(400).json({
        success: false,
        message: "Invalid assigned user ID.",
      });
      return;
    }

    // --------------------------------------------------------
    // Create issue
    // --------------------------------------------------------

    const issue = await createIssueService({
      repository: new mongoose.Types.ObjectId(repository),

      title: cleanTitle,

      description:
        typeof description === "string" ? description.trim() : undefined,

      priority,

      assignedTo: assignedTo
        ? new mongoose.Types.ObjectId(assignedTo)
        : undefined,

      createdBy: new mongoose.Types.ObjectId(req.user.id),
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully.",
      data: issue,
    });
  } catch (error: any) {
    console.error("Create issue error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create issue.",
    });
  }
};

// ============================================================
// GET ALL ISSUES
// ============================================================

export const getIssues = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    const issues = await getIssuesService();

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error: any) {
    console.error("Get issues error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve issues.",
    });
  }
};

// ============================================================
// GET ISSUE BY ID
// ============================================================

export const getIssueById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid issue ID.",
      });
      return;
    }

    const issue = await getIssueByIdService(id);

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
  } catch (error: any) {
    console.error("Get issue by ID error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve issue.",
    });
  }
};

// ============================================================
// UPDATE ISSUE
// ============================================================

export const updateIssue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    // --------------------------------------------------------
    // Validate ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid issue ID.",
      });
      return;
    }

    // --------------------------------------------------------
    // Find issue
    // --------------------------------------------------------

    const issue = await Issue.findById(id);

    if (!issue) {
      res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
      return;
    }

    // --------------------------------------------------------
    // Authorization
    // --------------------------------------------------------

    const currentUserId = req.user.id;

    const isAdmin = req.user.role === ROLE.ADMIN;

    const isCreator = issue.createdBy.toString() === currentUserId;

    const isAssignedUser = issue.assignedTo?.toString() === currentUserId;

    if (!isAdmin && !isCreator && !isAssignedUser) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to modify this issue.",
      });
      return;
    }

    // --------------------------------------------------------
    // WHITELIST update fields
    // --------------------------------------------------------

    const updateData: Record<string, unknown> = {};

    if (req.body.title !== undefined) {
      updateData.title = req.body.title;
    }

    if (req.body.description !== undefined) {
      updateData.description = req.body.description;
    }

    if (req.body.status !== undefined) {
      updateData.status = req.body.status;
    }

    if (req.body.priority !== undefined) {
      updateData.priority = req.body.priority;
    }

    if (req.body.assignedTo !== undefined) {
      updateData.assignedTo = req.body.assignedTo;
    }

    // --------------------------------------------------------
    // Assigned user validation
    // --------------------------------------------------------

    if (
      updateData.assignedTo &&
      !mongoose.Types.ObjectId.isValid(updateData.assignedTo.toString())
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid assigned user ID.",
      });
      return;
    }

    // --------------------------------------------------------
    // Update
    // --------------------------------------------------------

    const updatedIssue = await updateIssueService(id, updateData);

    if (!updatedIssue) {
      res.status(404).json({
        success: false,
        message: "Issue could not be updated.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Issue updated successfully.",
      data: updatedIssue,
    });
  } catch (error: any) {
    console.error("Update issue error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update issue.",
    });
  }
};

// ============================================================
// DELETE ISSUE
// ============================================================

export const deleteIssue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    // --------------------------------------------------------
    // Validate ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid issue ID.",
      });
      return;
    }

    // --------------------------------------------------------
    // Find issue
    // --------------------------------------------------------

    const issue = await Issue.findById(id);

    if (!issue) {
      res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
      return;
    }

    // --------------------------------------------------------
    // Authorization
    // --------------------------------------------------------

    const isAdmin = req.user.role === ROLE.ADMIN;

    const isCreator = issue.createdBy.toString() === req.user.id;

    if (!isAdmin && !isCreator) {
      res.status(403).json({
        success: false,
        message: "Only the issue creator or admin can delete this issue.",
      });
      return;
    }

    // --------------------------------------------------------
    // Delete comments
    // --------------------------------------------------------

    await IssueComment.deleteMany({
      issue: issue._id,
    });

    // --------------------------------------------------------
    // Delete issue
    // --------------------------------------------------------

    await deleteIssueService(id);

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete issue error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete issue.",
    });
  }
};

// ============================================================
// ADD ISSUE COMMENT
// ============================================================

export const addIssueComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    // --------------------------------------------------------
    // Validate issue ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid issue ID.",
      });
      return;
    }

    // --------------------------------------------------------
    // Check issue
    // --------------------------------------------------------

    const issue = await Issue.findById(id);

    if (!issue) {
      res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
      return;
    }

    // --------------------------------------------------------
    // Validate comment
    // --------------------------------------------------------

    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

    if (!text) {
      res.status(400).json({
        success: false,
        message: "Comment text is required.",
      });
      return;
    }

    // --------------------------------------------------------
    // Create comment
    // --------------------------------------------------------

    const comment = await IssueComment.create({
      issue: issue._id,
      user: new mongoose.Types.ObjectId(req.user.id),
      text,
    });

    // --------------------------------------------------------
    // Populate user
    // --------------------------------------------------------

    const populatedComment = await comment.populate("user", "name email role");

    res.status(201).json({
      success: true,
      message: "Issue comment added successfully.",
      data: populatedComment,
    });
  } catch (error: any) {
    console.error("Add issue comment error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to add issue comment.",
    });
  }
};

// ============================================================
// GET ISSUE COMMENTS
// ============================================================

export const getIssueComments = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // Validate issue ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid issue ID.",
      });
      return;
    }

    // --------------------------------------------------------
    // Check issue
    // --------------------------------------------------------

    const issue = await Issue.findById(id);

    if (!issue) {
      res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
      return;
    }

    // --------------------------------------------------------
    // Get comments
    // --------------------------------------------------------

    const comments = await IssueComment.find({
      issue: id,
    })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error: any) {
    console.error("Get issue comments error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve issue comments.",
    });
  }
};
