import mongoose from "mongoose";

import Task from "../models/task.models";
import Project from "../models/project.models";
import Team from "../models/team.models";

import { TASK_STATUS, TASK_PRIORITY } from "../types/task.types";

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (value: string): boolean => {
  return mongoose.Types.ObjectId.isValid(value);
};

// ============================================================
// PROJECT ACCESS
// ============================================================

export const requireTaskProjectAccess = async (
  projectId: string,
  userId: string,
): Promise<any> => {
  if (!isValidObjectId(projectId) || !isValidObjectId(userId)) {
    const error: any = new Error("Invalid project or user ID.");

    error.statusCode = 400;

    throw error;
  }

  const project = await Project.findById(projectId);

  if (!project) {
    const error: any = new Error("Project not found.");

    error.statusCode = 404;

    throw error;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Project creator
  if (project.createdBy?.toString() === userId) {
    return project;
  }

  // Project members
  const isProjectMember = project.members?.some(
    (member) => member.toString() === userId,
  );

  if (isProjectMember) {
    return project;
  }

  // Team owner/member
  if (project.team) {
    const team = await Team.findById(project.team);

    if (team) {
      if (team.owner?.toString() === userId) {
        return project;
      }

      const isTeamMember = team.members?.some(
        (member) => member.toString() === userId,
      );

      if (isTeamMember) {
        return project;
      }
    }
  }

  const error: any = new Error("You do not have access to this project.");

  error.statusCode = 403;

  throw error;
};

// ============================================================
// TASK ACCESS
// ============================================================

const requireTaskAccess = async (task: any, userId: string) => {
  await requireTaskProjectAccess(task.project.toString(), userId);

  return task;
};

// ============================================================
// CREATE TASK
// ============================================================

interface CreateTaskInput {
  project: string;

  title: string;

  description?: string;

  assignedTo?: string;

  dueDate?: string | Date;

  priority?: TASK_PRIORITY;

  createdBy?: string;
}

export const createTaskService = async (data: CreateTaskInput) => {
  if (!data.createdBy) {
    const error: any = new Error("Authenticated user is required.");

    error.statusCode = 401;

    throw error;
  }

  if (!isValidObjectId(data.project)) {
    const error: any = new Error("Invalid project ID.");

    error.statusCode = 400;

    throw error;
  }

  const project = await requireTaskProjectAccess(data.project, data.createdBy);

  if (!data.title || !data.title.trim()) {
    const error: any = new Error("Task title is required.");

    error.statusCode = 400;

    throw error;
  }

  // --------------------------------------------------------
  // Validate assigned user
  // --------------------------------------------------------

  if (data.assignedTo) {
    if (!isValidObjectId(data.assignedTo)) {
      const error: any = new Error("Invalid assigned user ID.");

      error.statusCode = 400;

      throw error;
    }

    // Make sure assignee belongs to project
    await requireTaskProjectAccess(data.project, data.assignedTo);
  }

  // --------------------------------------------------------
  // Validate priority
  // --------------------------------------------------------

  const priority = data.priority || "Medium";

  if (!["Low", "Medium", "High", "Critical"].includes(priority)) {
    const error: any = new Error("Invalid task priority.");

    error.statusCode = 400;

    throw error;
  }

  // --------------------------------------------------------
  // Validate due date
  // --------------------------------------------------------

  let dueDate: Date | null = null;

  if (data.dueDate) {
    const parsed = new Date(data.dueDate);

    if (Number.isNaN(parsed.getTime())) {
      const error: any = new Error("Invalid due date.");

      error.statusCode = 400;

      throw error;
    }

    dueDate = parsed;
  }

  // --------------------------------------------------------
  // Create
  // --------------------------------------------------------

  const task = await Task.create({
    project: project._id,
    title: data.title.trim(),
    description: data.description?.trim() || "",
    assignedTo: data.assignedTo || null,
    dueDate,
    priority,
    status: "Todo",
    createdBy: data.createdBy,
  });

  // --------------------------------------------------------
  // Populate
  // --------------------------------------------------------

  await task.populate([
    {
      path: "assignedTo",
      select: "firstName lastName email role",
    },
    {
      path: "createdBy",
      select: "firstName lastName email role",
    },
    {
      path: "project",
      select: "name description",
    },
  ]);

  return task;
};

// ============================================================
// GET TASKS
// ============================================================

export const getTasksService = async (projectId: string, userId: string) => {
  await requireTaskProjectAccess(projectId, userId);

  const tasks = await Task.find({
    project: projectId,
  })
    .populate("assignedTo", "firstName lastName email role")
    .populate("createdBy", "firstName lastName email role")
    .populate("project", "name description")
    .sort({
      createdAt: -1,
    })
    .lean();

  const now = new Date();

  return tasks.map((task: any) => ({
    ...task,

    overdue:
      !!task.dueDate &&
      new Date(task.dueDate) < now &&
      task.status !== "Completed",
  }));
};

// ============================================================
// GET SINGLE TASK
// ============================================================

export const getTaskByIdService = async (
  taskId: string,
  userId: string,
  _userRole?: string,
) => {
  if (!isValidObjectId(taskId)) {
    const error: any = new Error("Invalid task ID.");

    error.statusCode = 400;

    throw error;
  }

  const task = await Task.findById(taskId)
    .populate("assignedTo", "firstName lastName email role")
    .populate("createdBy", "firstName lastName email role")
    .populate("project", "name description");

  if (!task) {
    return null;
  }

  await requireTaskAccess(task, userId);

  const taskObject: any = task.toObject();

  return {
    ...taskObject,

    overdue:
      !!taskObject.dueDate &&
      new Date(taskObject.dueDate) < new Date() &&
      taskObject.status !== "Completed",
  };
};

// ============================================================
// UPDATE TASK
// ============================================================

export const updateTaskService = async (
  taskId: string,
  data: any,
  userId: string,
) => {
  if (!isValidObjectId(taskId)) {
    const error: any = new Error("Invalid task ID.");

    error.statusCode = 400;

    throw error;
  }

  const task = await Task.findById(taskId);

  if (!task) {
    return null;
  }

  await requireTaskAccess(task, userId);

  // --------------------------------------------------------
  // Only creator or assignee can modify
  // --------------------------------------------------------

  const isCreator = task.createdBy.toString() === userId;

  const isAssignee = task.assignedTo?.toString() === userId;

  if (!isCreator && !isAssignee) {
    const error: any = new Error("You are not allowed to modify this task.");

    error.statusCode = 403;

    throw error;
  }

  // --------------------------------------------------------
  // Allowed fields
  // --------------------------------------------------------

  if (data.title !== undefined) {
    if (!String(data.title).trim()) {
      const error: any = new Error("Task title cannot be empty.");

      error.statusCode = 400;

      throw error;
    }

    task.title = String(data.title).trim();
  }

  if (data.description !== undefined) {
    task.description = String(data.description).trim();
  }

  if (data.status !== undefined) {
    const allowedStatuses = ["Todo", "In Progress", "Completed"];

    if (!allowedStatuses.includes(data.status)) {
      const error: any = new Error("Invalid task status.");

      error.statusCode = 400;

      throw error;
    }

    task.status = data.status;
  }

  if (data.priority !== undefined) {
    const allowedPriorities = ["Low", "Medium", "High", "Critical"];

    if (!allowedPriorities.includes(data.priority)) {
      const error: any = new Error("Invalid task priority.");

      error.statusCode = 400;

      throw error;
    }

    task.priority = data.priority;
  }

  if (data.assignedTo !== undefined) {
    if (data.assignedTo === null || data.assignedTo === "") {
      task.assignedTo = null;
    } else {
      if (!isValidObjectId(data.assignedTo)) {
        const error: any = new Error("Invalid assigned user ID.");

        error.statusCode = 400;

        throw error;
      }

      await requireTaskProjectAccess(task.project.toString(), data.assignedTo);

      task.assignedTo = data.assignedTo;
    }
  }

  if (data.dueDate !== undefined) {
    if (data.dueDate === null || data.dueDate === "") {
      task.dueDate = null;
    } else {
      const parsed = new Date(data.dueDate);

      if (Number.isNaN(parsed.getTime())) {
        const error: any = new Error("Invalid due date.");

        error.statusCode = 400;

        throw error;
      }

      task.dueDate = parsed;
    }
  }

  await task.save();

  await task.populate([
    {
      path: "assignedTo",
      select: "firstName lastName email role",
    },
    {
      path: "createdBy",
      select: "firstName lastName email role",
    },
    {
      path: "project",
      select: "name description",
    },
  ]);

  return task;
};

// ============================================================
// DELETE TASK
// ============================================================

export const deleteTaskService = async (taskId: string, userId: string) => {
  if (!isValidObjectId(taskId)) {
    const error: any = new Error("Invalid task ID.");

    error.statusCode = 400;

    throw error;
  }

  const task = await Task.findById(taskId);

  if (!task) {
    return null;
  }

  await requireTaskAccess(task, userId);

  const isCreator = task.createdBy.toString() === userId;

  if (!isCreator) {
    const error: any = new Error("Only the task creator can delete this task.");

    error.statusCode = 403;

    throw error;
  }

  await task.deleteOne();

  return task;
};

// ============================================================
// KANBAN
// ============================================================

export const getKanbanService = async (projectId: string, userId: string) => {
  const tasks = await getTasksService(projectId, userId);

  return {
    todo: tasks.filter((task: any) => task.status === "Todo"),

    inProgress: tasks.filter((task: any) => task.status === "In Progress"),

    completed: tasks.filter((task: any) => task.status === "Completed"),
  };
};
