import mongoose from "mongoose";

import Project from "../models/project.models";
import Task from "../models/task.models";
import Issue from "../models/issue.models";
import Repository from "../models/repository.models";

// Generate Project Report
export const getProjectReportService = async (
  projectId: string
) => {
  // Check whether ID is valid
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID.");
  }

  // Check project
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  // Get all tasks belonging to project
  const tasks = await Task.find({
    project: projectId,
  });

  // Get all issues belonging to project
  const issues = await Issue.find({
    project: projectId,
  });

  // Get all repositories belonging to project
  const repositories = await Repository.find({
    project: projectId,
  });

  // Task statistics
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task: any) =>
      task.status?.toLowerCase() === "completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task: any) =>
      task.status?.toLowerCase() === "in progress" ||
      task.status?.toLowerCase() === "in-progress"
  ).length;

  const pendingTasks = tasks.filter(
    (task: any) =>
      task.status?.toLowerCase() === "pending" ||
      task.status?.toLowerCase() === "todo" ||
      task.status?.toLowerCase() === "to do"
  ).length;

  // Overdue tasks
  const now = new Date();

  const overdueTasks = tasks.filter((task: any) => {
    if (!task.dueDate) {
      return false;
    }

    if (
      task.status?.toLowerCase() === "completed"
    ) {
      return false;
    }

    return new Date(task.dueDate) < now;
  }).length;

  // Completion percentage
  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  // Issue statistics
  const totalIssues = issues.length;

  const closedIssues = issues.filter(
    (issue: any) =>
      issue.status?.toLowerCase() === "closed" ||
      issue.status?.toLowerCase() === "resolved" ||
      issue.status?.toLowerCase() === "completed"
  ).length;

  const openIssues = totalIssues - closedIssues;

  return {
    projectId,

    project,

    tasks: {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      pending: pendingTasks,
      overdue: overdueTasks,
      completionRate,
    },

    issues: {
      total: totalIssues,
      open: openIssues,
      closed: closedIssues,
    },

    repositories: {
      total: repositories.length,
    },
  };
};


// Get Task Report
export const getTaskReportService = async (
  projectId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID.");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  const tasks = await Task.find({
    project: projectId,
  }).populate("assignedTo");

  const total = tasks.length;

  const completed = tasks.filter(
    (task: any) =>
      task.status?.toLowerCase() === "completed"
  ).length;

  const inProgress = tasks.filter(
    (task: any) =>
      task.status?.toLowerCase() === "in progress" ||
      task.status?.toLowerCase() === "in-progress"
  ).length;

  const pending = tasks.filter(
    (task: any) =>
      task.status?.toLowerCase() === "pending" ||
      task.status?.toLowerCase() === "todo" ||
      task.status?.toLowerCase() === "to do"
  ).length;

  const overdue = tasks.filter((task: any) => {
    if (!task.dueDate) {
      return false;
    }

    if (
      task.status?.toLowerCase() === "completed"
    ) {
      return false;
    }

    return new Date(task.dueDate) < new Date();
  }).length;

  return {
    projectId,
    total,
    completed,
    inProgress,
    pending,
    overdue,
    completionRate:
      total === 0
        ? 0
        : Math.round((completed / total) * 100),
    tasks,
  };
};


// Get Issue Report
export const getIssueReportService = async (
  projectId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID.");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  const issues = await Issue.find({
    project: projectId,
  });

  const total = issues.length;

  const closed = issues.filter(
    (issue: any) =>
      issue.status?.toLowerCase() === "closed" ||
      issue.status?.toLowerCase() === "resolved" ||
      issue.status?.toLowerCase() === "completed"
  ).length;

  const open = total - closed;

  return {
    projectId,
    total,
    open,
    closed,
    issues,
  };
};