import { Response } from "express";
import { AuthRequest } from "../types/custom";
import mongoose from "mongoose";
import Issue from "../models/issue.models";
import IssueComment from "../models/issueComment.models";

import {
  createIssueService,
  getIssuesService,
  getIssueByIdService,
  updateIssueService,
  deleteIssueService,
} from "../services/issue.service";


export const createIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { repository, title, description, priority, assignedTo } = req.body;

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
      createdBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
    } as any);

    res.status(201).json({
      success: true,
      message: "Issue created successfully.",
      data: issue,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getIssues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issues = await getIssuesService();

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getIssueById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await getIssueByIdService(req.params.id);

    if (!issue) {
      res.status(404).json({ success: false, message: "Issue not found." });
      return;
    }

    res.status(200).json({ success: true, data: issue });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({ success: false, message: "Issue not found." });
      return;
    }

    if (
      issue.createdBy.toString() !== req.user?.id &&
      issue.assignedTo?.toString() !== req.user?.id
    ) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to modify this issue.",
      });
      return;
    }

    const updated = await updateIssueService(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Issue updated successfully.",
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({ success: false, message: "Issue not found." });
      return;
    }

    if (issue.createdBy.toString() !== req.user?.id) {
      res.status(403).json({
        success: false,
        message: "Only the issue creator can delete this issue.",
      });
      return;
    }

    await IssueComment.deleteMany({ issue: issue._id });
    await deleteIssueService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully.",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const addIssueComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({ success: false, message: "Issue not found." });
      return;
    }

    if (!req.body.text?.trim()) {
      res.status(400).json({
        success: false,
        message: "Comment text is required.",
      });
      return;
    }

    const comment = await IssueComment.create({
      issue: issue._id,
      user: req.user?.id,
      text: req.body.text,
    });

    const populated = await comment.populate("user", "name email role");

    res.status(201).json({
      success: true,
      message: "Issue comment added successfully.",
      data: populated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getIssueComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const comments = await IssueComment.find({ issue: req.params.id })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};