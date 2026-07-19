import { Response } from "express";
import Issue from "../models/issue.models";
import { AuthRequest } from "../types/custom";

// Create Issue
export const createIssue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const issue = new Issue({
      ...req.body,
      createdBy: req.user?.id,
    });

    const savedIssue = await issue.save();

    res.status(201).json(savedIssue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Issues
export const getIssues = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const issues = await Issue.find()
      .populate("repository")
      .populate("createdBy")
      .populate("assignedTo");

    res.status(200).json(issues);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Issue
export const getIssueById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({
        message: "Issue not found",
      });
      return;
    }

    res.status(200).json(issue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update Issue
export const updateIssue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!issue) {
      res.status(404).json({
        message: "Issue not found",
      });
      return;
    }

    res.status(200).json(issue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Issue
export const deleteIssue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      res.status(404).json({
        message: "Issue not found",
      });
      return;
    }

    res.status(200).json({
      message: "Issue deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Change Issue Status
export const updateIssueStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({
        message: "Issue not found",
      });
      return;
    }

    issue.status = req.body.status;

    await issue.save();

    res.status(200).json(issue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};