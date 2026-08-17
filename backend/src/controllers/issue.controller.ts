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
  deleteIssueService,
} from "../services/issue.service";

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
    // Validate authenticated user
    // --------------------------------------------------------

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. User information not found.",
      });
      return;
    }

    // --------------------------------------------------------
    // Validate repository
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
    // Validate title
    // --------------------------------------------------------

    if (!title || !title.trim()) {
      res.status(400).json({
        success: false,
        message: "Issue title is required.",
      });
      return;
    }

    if (title.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: "Issue title must be at least 3 characters.",
      });
      return;
    }

    // --------------------------------------------------------
    // Validate assigned user
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
      title: title.trim(),
      description: description?.trim(),
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
  } catch (err: any) {
    console.error("Create issue error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to create issue.",
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
        message: "Unauthorized. User information not found.",
      });
      return;
    }

    const issues = await getIssuesService();

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (err: any) {
    console.error("Get issues error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve issues.",
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
  } catch (err: any) {
    console.error("Get issue by ID error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve issue.",
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
        message: "Unauthorized. User information not found.",
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
    //
    // ADMIN can modify any issue.
    // Issue creator can modify their issue.
    // Assigned user can modify their issue.
    // --------------------------------------------------------

    const userId = req.user.id;
    const userRole = req.user.role;

    const isAdmin = userRole === "ADMIN";

    const isCreator = issue.createdBy.toString() === userId;

    const isAssignedUser = issue.assignedTo?.toString() === userId;

    if (!isAdmin && !isCreator && !isAssignedUser) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to modify this issue.",
      });
      return;
    }

    // --------------------------------------------------------
    // Prevent changing protected ownership fields
    // --------------------------------------------------------

    const updateData = {
      ...req.body,
    };

    delete updateData.createdBy;

    // --------------------------------------------------------
    // Validate assignedTo
    // --------------------------------------------------------

    if (
      updateData.assignedTo &&
      !mongoose.Types.ObjectId.isValid(updateData.assignedTo)
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
  } catch (err: any) {
    console.error("Update issue error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to update issue.",
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
        message: "Unauthorized. User information not found.",
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
    //
    // ADMIN or creator can delete.
    // --------------------------------------------------------

    const isAdmin = req.user.role === "ADMIN";

    const isCreator = issue.createdBy.toString() === req.user.id;

    if (!isAdmin && !isCreator) {
      res.status(403).json({
        success: false,
        message: "Only the issue creator or admin can delete this issue.",
      });
      return;
    }

    // --------------------------------------------------------
    // Delete associated comments
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
  } catch (err: any) {
    console.error("Delete issue error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to delete issue.",
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
        message: "Unauthorized. User information not found.",
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

    const populatedComment = await comment.populate("user", "name email role");

    res.status(201).json({
      success: true,
      message: "Issue comment added successfully.",
      data: populatedComment,
    });
  } catch (err: any) {
    console.error("Add issue comment error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to add issue comment.",
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
    // Make sure issue exists
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
  } catch (err: any) {
    console.error("Get issue comments error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve issue comments.",
    });
  }
};
