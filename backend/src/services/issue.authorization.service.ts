import mongoose from "mongoose";

import Issue from "../models/issue.models";
import Repository from "../models/repository.models";
import Project from "../models/project.models";

interface AuthorizationResult {
  allowed: boolean;
  issue?: any;
  repository?: any;
  project?: any;
}

// ============================================================
// CHECK WHETHER USER CAN ACCESS AN ISSUE
// ============================================================

export const authorizeIssueAccess = async (
  issueId: string,
  userId: string,
  userRole?: string,
): Promise<AuthorizationResult> => {
  // ----------------------------------------------------------
  // VALIDATE IDS
  // ----------------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(issueId)) {
    throw new Error("Invalid issue ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  // ----------------------------------------------------------
  // ADMIN
  // ----------------------------------------------------------

  if (userRole === "ADMIN") {
    const issue = await Issue.findById(issueId);

    if (!issue) {
      return {
        allowed: false,
      };
    }

    const repository = await Repository.findById(issue.repository);

    if (!repository) {
      return {
        allowed: false,
      };
    }

    const project = await Project.findById(repository.project);

    if (!project) {
      return {
        allowed: false,
      };
    }

    return {
      allowed: true,
      issue,
      repository,
      project,
    };
  }

  // ----------------------------------------------------------
  // FIND ISSUE
  // ----------------------------------------------------------

  const issue = await Issue.findById(issueId);

  if (!issue) {
    return {
      allowed: false,
    };
  }

  // ----------------------------------------------------------
  // FIND REPOSITORY
  // ----------------------------------------------------------

  const repository = await Repository.findById(issue.repository);

  if (!repository) {
    return {
      allowed: false,
    };
  }

  // ----------------------------------------------------------
  // FIND PROJECT
  // ----------------------------------------------------------

  const project = await Project.findById(repository.project);

  if (!project) {
    return {
      allowed: false,
    };
  }

  // ----------------------------------------------------------
  // PROJECT CREATOR
  // ----------------------------------------------------------

  if (project.createdBy.toString() === userId) {
    return {
      allowed: true,
      issue,
      repository,
      project,
    };
  }

  // ----------------------------------------------------------
  // PROJECT MEMBER
  // ----------------------------------------------------------

  const isMember = project.members.some(
    (member) => member.toString() === userId,
  );

  if (isMember) {
    return {
      allowed: true,
      issue,
      repository,
      project,
    };
  }

  // ----------------------------------------------------------
  // ACCESS DENIED
  // ----------------------------------------------------------

  return {
    allowed: false,
    issue,
    repository,
    project,
  };
};
