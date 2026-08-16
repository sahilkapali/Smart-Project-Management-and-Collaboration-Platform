import mongoose from "mongoose";

import Project from "../models/project.models";
import Task from "../models/task.models";
import Repository from "../models/repository.models";
import Issue from "../models/issue.models";

/**
 * GET PROJECT REPORT
 *
 * Generates a complete report for a single project.
 *
 * Includes:
 * - Project information
 * - Project creator
 * - Team information
 * - Project members count
 * - Repository count
 * - Task statistics
 * - Issue statistics
 * - Report generation time
 */
export const getProjectReportService = async (projectId: string) => {
  // =====================================================
  // VALIDATE PROJECT ID
  // =====================================================

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID.");
  }

  const projectObjectId = new mongoose.Types.ObjectId(projectId);

  // =====================================================
  // GET PROJECT
  // =====================================================

  const project = await Project.findById(projectObjectId)
    .populate("createdBy", "firstName lastName email role")
    .populate("members", "firstName lastName email role")
    .populate("team", "name description");

  if (!project) {
    throw new Error("Project not found.");
  }

  // =====================================================
  // GET TASKS
  // =====================================================

  const tasks = await Task.find({
    project: projectObjectId,
  });

  // =====================================================
  // TASK STATISTICS
  // =====================================================

  const taskStats = {
    total: tasks.length,

    completed: tasks.filter((task) => task.status === "Completed").length,

    inProgress: tasks.filter((task) => task.status === "In Progress").length,

    todo: tasks.filter((task) => task.status === "Todo").length,
  };

  // =====================================================
  // GET REPOSITORIES
  // =====================================================

  const repositories = await Repository.find({
    project: projectObjectId,
  });

  const repositoryIds = repositories.map((repository) => repository._id);

  // =====================================================
  // ISSUE STATISTICS
  //
  // We use countDocuments instead of creating an
  // untyped empty array. This avoids the TypeScript
  // implicit "any[]" error.
  // =====================================================

  const issueFilter = {
    repository: {
      $in: repositoryIds,
    },
  };

  const issueTotal = await Issue.countDocuments(issueFilter);

  const issueOpen = await Issue.countDocuments({
    ...issueFilter,
    status: "Open",
  });

  const issueInProgress = await Issue.countDocuments({
    ...issueFilter,
    status: "In Progress",
  });

  const issueResolved = await Issue.countDocuments({
    ...issueFilter,
    status: {
      $in: ["Resolved", "Closed"],
    },
  });

  const issueStats = {
    total: issueTotal,
    open: issueOpen,
    inProgress: issueInProgress,
    resolved: issueResolved,
  };

  // =====================================================
  // RETURN REPORT
  // =====================================================

  return {
    project: {
      id: project._id,
      name: project.name,
      description: project.description,

      createdBy: project.createdBy,

      team: project.team,

      status: project.status,

      startDate: project.startDate,
      dueDate: project.dueDate,

      membersCount: project.members?.length || 0,
    },

    repositoriesCount: repositories.length,

    taskStats,

    issueStats,

    generatedAt: new Date(),
  };
};
