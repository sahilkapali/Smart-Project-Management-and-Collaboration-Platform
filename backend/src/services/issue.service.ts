import mongoose from "mongoose";
import Issue, { IIssue } from "../models/issue.models";

// ============================================================
// CREATE ISSUE
// ============================================================

export const createIssueService = async (data: Partial<IIssue>) => {
  if (!data.repository) {
    throw new Error("Repository is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(data.repository.toString())) {
    throw new Error("Invalid repository ID.");
  }

  if (!data.title || !data.title.trim()) {
    throw new Error("Issue title is required.");
  }

  if (data.title.trim().length < 3) {
    throw new Error("Issue title must be at least 3 characters.");
  }

  if (!data.createdBy) {
    throw new Error("Issue creator is required.");
  }

  const issue = await Issue.create({
    ...data,
    title: data.title.trim(),
    description: data.description?.trim(),
  });

  return await Issue.findById(issue._id)
    .populate("repository")
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role");
};

// ============================================================
// GET ALL ISSUES
// ============================================================

export const getIssuesService = async () => {
  return await Issue.find()
    .populate("repository")
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 });
};

// ============================================================
// GET ISSUE BY ID
// ============================================================

export const getIssueByIdService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid issue ID.");
  }

  return await Issue.findById(id)
    .populate("repository")
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role");
};

// ============================================================
// UPDATE ISSUE
// ============================================================

export const updateIssueService = async (id: string, data: Partial<IIssue>) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid issue ID.");
  }

  const updateData: Record<string, unknown> = {
    ...data,
  };

  if (typeof updateData.title === "string") {
    updateData.title = updateData.title.trim();

    if (!updateData.title) {
      throw new Error("Issue title cannot be empty.");
    }

    if ((updateData.title as string).length < 3) {
      throw new Error("Issue title must be at least 3 characters.");
    }
  }

  if (typeof updateData.description === "string") {
    updateData.description = updateData.description.trim();
  }

  if (updateData.repository) {
    if (!mongoose.Types.ObjectId.isValid(updateData.repository.toString())) {
      throw new Error("Invalid repository ID.");
    }
  }

  if (updateData.assignedTo) {
    if (!mongoose.Types.ObjectId.isValid(updateData.assignedTo.toString())) {
      throw new Error("Invalid assigned user ID.");
    }
  }

  const issue = await Issue.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("repository")
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role");

  return issue;
};

// ============================================================
// DELETE ISSUE
// ============================================================

export const deleteIssueService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid issue ID.");
  }

  return await Issue.findByIdAndDelete(id);
};
