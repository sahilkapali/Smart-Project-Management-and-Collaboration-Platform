import mongoose from "mongoose";

import Issue, { IIssue } from "../models/issue.models";

// ============================================================
// CREATE ISSUE
// ============================================================

export const createIssueService = async (data: Partial<IIssue>) => {
  // ----------------------------------------------------------
  // VALIDATE REPOSITORY
  // ----------------------------------------------------------

  if (!data.repository) {
    throw new Error("Repository is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(data.repository.toString())) {
    throw new Error("Invalid repository ID.");
  }

  // ----------------------------------------------------------
  // VALIDATE TITLE
  // ----------------------------------------------------------

  if (!data.title || !data.title.trim()) {
    throw new Error("Issue title is required.");
  }

  const title = data.title.trim();

  if (title.length < 3) {
    throw new Error("Issue title must be at least 3 characters.");
  }

  // ----------------------------------------------------------
  // VALIDATE CREATOR
  // ----------------------------------------------------------

  if (!data.createdBy) {
    throw new Error("Issue creator is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(data.createdBy.toString())) {
    throw new Error("Invalid creator ID.");
  }

  // ----------------------------------------------------------
  // VALIDATE ASSIGNED USER
  // ----------------------------------------------------------

  if (
    data.assignedTo &&
    !mongoose.Types.ObjectId.isValid(data.assignedTo.toString())
  ) {
    throw new Error("Invalid assigned user ID.");
  }

  // ----------------------------------------------------------
  // CREATE ISSUE
  // ----------------------------------------------------------

  const issue = await Issue.create({
    repository: data.repository,
    title,
    description: data.description?.trim() || "",
    priority: data.priority,
    assignedTo: data.assignedTo,
    createdBy: data.createdBy,
    status: data.status,
  });

  // ----------------------------------------------------------
  // RETURN POPULATED ISSUE
  // ----------------------------------------------------------

  const populatedIssue = await Issue.findById(issue._id)
    .populate("repository")
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role");

  return populatedIssue;
};

// ============================================================
// GET ALL ISSUES
// ============================================================

export const getIssuesService = async () => {
  const issues = await Issue.find()
    .populate("repository")
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 });

  return issues;
};

// ============================================================
// GET ISSUE BY ID
// ============================================================

export const getIssueByIdService = async (id: string) => {
  // ----------------------------------------------------------
  // VALIDATE ID
  // ----------------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid issue ID.");
  }

  // ----------------------------------------------------------
  // FIND ISSUE
  // ----------------------------------------------------------

  const issue = await Issue.findById(id)
    .populate("repository")
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role");

  return issue;
};

// ============================================================
// UPDATE ISSUE
// ============================================================

// ============================================================
// UPDATE ISSUE
// ============================================================

export const updateIssueService = async (id: string, data: Partial<IIssue>) => {
  // ----------------------------------------------------------
  // Validate issue ID
  // ----------------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid issue ID.");
  }

  // ----------------------------------------------------------
  // Build update data
  // ----------------------------------------------------------

  const updateData: Record<string, unknown> = {
    ...data,
  };

  // ----------------------------------------------------------
  // Never allow createdBy to be changed
  // ----------------------------------------------------------

  delete updateData.createdBy;

  // ----------------------------------------------------------
  // TITLE
  // ----------------------------------------------------------

  if (typeof updateData.title === "string") {
    const title = updateData.title.trim();

    if (!title) {
      throw new Error("Issue title cannot be empty.");
    }

    if (title.length < 3) {
      throw new Error("Issue title must be at least 3 characters.");
    }

    updateData.title = title;
  }

  // ----------------------------------------------------------
  // DESCRIPTION
  // ----------------------------------------------------------

  if (typeof updateData.description === "string") {
    updateData.description = updateData.description.trim();
  }

  // ----------------------------------------------------------
  // REPOSITORY
  // ----------------------------------------------------------

  if (updateData.repository !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(String(updateData.repository))) {
      throw new Error("Invalid repository ID.");
    }
  }

  // ----------------------------------------------------------
  // ASSIGNED USER
  // ----------------------------------------------------------

  if (
    updateData.assignedTo !== undefined &&
    updateData.assignedTo !== null &&
    updateData.assignedTo !== ""
  ) {
    if (!mongoose.Types.ObjectId.isValid(String(updateData.assignedTo))) {
      throw new Error("Invalid assigned user ID.");
    }
  }

  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------

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
