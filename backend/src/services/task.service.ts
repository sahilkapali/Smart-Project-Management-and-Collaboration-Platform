import mongoose from "mongoose";

import Task from "../models/task.models";
import Project from "../models/project.models";
import Team from "../models/team.models";

import { TASK_PRIORITY } from "../types/task.types";

import * as aiService from "./gemini.service";
import { createNotification } from "./notification.service";
import {
  NotificationType,
  NotificationEntityType,
} from "../types/notification.types";

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (value: string): boolean => {
  return mongoose.Types.ObjectId.isValid(value);
};

const createServiceError = (message: string, statusCode: number) => {
  const error: any = new Error(message);

  error.statusCode = statusCode;

  return error;
};

// ============================================================
// PROJECT ACCESS
// ============================================================

export const requireTaskProjectAccess = async (
  projectId: string,
  userId: string,
): Promise<any> => {
  if (!isValidObjectId(projectId) || !isValidObjectId(userId)) {
    throw createServiceError("Invalid project or user ID.", 400);
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw createServiceError("Project not found.", 404);
  }

  if (project.createdBy?.toString() === userId) {
    return project;
  }

  const isProjectMember = project.members?.some(
    (member) => member.toString() === userId,
  );

  if (isProjectMember) {
    return project;
  }

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

  throw createServiceError("You do not have access to this project.", 403);
};

// ============================================================
// TASK ACCESS
// ============================================================

const requireTaskAccess = async (task: any, userId: string) => {
  await requireTaskProjectAccess(task.project.toString(), userId);

  return task;
};

// ============================================================
// POPULATE TASK
// ============================================================

const populateTask = async (task: any) => {
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
    throw createServiceError("Authenticated user is required.", 401);
  }

  if (!isValidObjectId(data.project)) {
    throw createServiceError("Invalid project ID.", 400);
  }

  const project = await requireTaskProjectAccess(data.project, data.createdBy);

  if (!data.title || !data.title.trim()) {
    throw createServiceError("Task title is required.", 400);
  }

  if (data.assignedTo) {
    if (!isValidObjectId(data.assignedTo)) {
      throw createServiceError("Invalid assigned user ID.", 400);
    }

    await requireTaskProjectAccess(data.project, data.assignedTo);
  }

  const priority = data.priority || "Medium";

  if (!["Low", "Medium", "High", "Critical"].includes(priority)) {
    throw createServiceError("Invalid task priority.", 400);
  }

  let dueDate: Date | null = null;

  if (data.dueDate) {
    const parsed = new Date(data.dueDate);

    if (Number.isNaN(parsed.getTime())) {
      throw createServiceError("Invalid due date.", 400);
    }

    dueDate = parsed;
  }

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

  await populateTask(task);

  if (data.assignedTo && data.assignedTo.toString() !== data.createdBy) {
    await createNotification(
      data.assignedTo.toString(),
      `You were assigned to task "${task.title}"`,
      NotificationType.TASK_ASSIGNED,
      data.createdBy,
      task._id.toString(),
      NotificationEntityType.TASK
    );
  }

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
    throw createServiceError("Invalid task ID.", 400);
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
    throw createServiceError("Invalid task ID.", 400);
  }

  const task = await Task.findById(taskId);

  if (!task) {
    return null;
  }

  await requireTaskAccess(task, userId);

  const isCreator = task.createdBy.toString() === userId;
  const isAssignee = task.assignedTo?.toString() === userId;

  if (!isCreator && !isAssignee) {
    throw createServiceError("You are not allowed to modify this task.", 403);
  }

  const previousAssignee = task.assignedTo ? task.assignedTo.toString() : null;

  if (data.title !== undefined) {
    if (!String(data.title).trim()) {
      throw createServiceError("Task title cannot be empty.", 400);
    }

    task.title = String(data.title).trim();
  }

  if (data.description !== undefined) {
    task.description = String(data.description).trim();
  }

  if (data.status !== undefined) {
    const allowedStatuses = ["Todo", "In Progress", "Completed"];

    if (!allowedStatuses.includes(data.status)) {
      throw createServiceError("Invalid task status.", 400);
    }

    task.status = data.status;
  }

  if (data.priority !== undefined) {
    const allowedPriorities = ["Low", "Medium", "High", "Critical"];

    if (!allowedPriorities.includes(data.priority)) {
      throw createServiceError("Invalid task priority.", 400);
    }

    task.priority = data.priority;
  }

  if (data.assignedTo !== undefined) {
    if (data.assignedTo === null || data.assignedTo === "") {
      task.assignedTo = null;
    } else {
      if (!isValidObjectId(data.assignedTo)) {
        throw createServiceError("Invalid assigned user ID.", 400);
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
        throw createServiceError("Invalid due date.", 400);
      }

      task.dueDate = parsed;
    }
  }

  await task.save();

  await populateTask(task);

  const newAssignee = task.assignedTo?._id?.toString() || task.assignedTo?.toString();

  if (newAssignee && newAssignee !== previousAssignee && newAssignee !== userId) {
    await createNotification(
      newAssignee,
      `You were assigned to task "${task.title}"`,
      NotificationType.TASK_ASSIGNED,
      userId,
      task._id.toString(),
      NotificationEntityType.TASK
    );
  } else if (newAssignee && newAssignee === previousAssignee && newAssignee !== userId) {
    await createNotification(
      newAssignee,
      `Task "${task.title}" was updated`,
      NotificationType.TASK_UPDATED,
      userId,
      task._id.toString(),
      NotificationEntityType.TASK
    );
  }

  return task;
};

// ============================================================
// DELETE TASK
// ============================================================

export const deleteTaskService = async (taskId: string, userId: string) => {
  if (!isValidObjectId(taskId)) {
    throw createServiceError("Invalid task ID.", 400);
  }

  const task = await Task.findById(taskId);

  if (!task) {
    return null;
  }

  await requireTaskAccess(task, userId);

  const isCreator = task.createdBy.toString() === userId;

  if (!isCreator) {
    throw createServiceError(
      "Only the task creator can delete this task.",
      403,
    );
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

// ============================================================
// AI PRIORITIZE ALL PROJECT TASKS
// ============================================================

export const autoPrioritizeProjectTasksService = async (
  projectId: string,
  userId: string,
) => {
  if (!isValidObjectId(projectId)) {
    throw createServiceError("Invalid project ID.", 400);
  }

  await requireTaskProjectAccess(projectId, userId);

  const tasks = await Task.find({
    project: projectId,
  }).sort({
    dueDate: 1,
    createdAt: 1,
  });

  if (tasks.length === 0) {
    return [];
  }

  const now = new Date();

  const tasksContext = tasks
    .map((task, index) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;

      const isOverdue =
        !!dueDate && dueDate < now && task.status !== "Completed";

      const daysUntilDue = dueDate
        ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return `
TASK ${index + 1}

Task ID:
${task._id.toString()}

Title:
${task.title}

Description:
${task.description || "No description provided"}

Status:
${task.status}

Current Priority:
${task.priority}

Due Date:
${dueDate ? dueDate.toISOString() : "No due date"}

Days Until Due:
${daysUntilDue === null ? "No due date" : daysUntilDue}

Overdue:
${isOverdue ? "YES" : "NO"}

Assigned:
${task.assignedTo ? "YES" : "NO"}
`;
    })
    .join("\n------------------------------\n");

  const aiResults = await aiService.prioritizeProjectTasks(tasksContext);

  const validTaskIds = new Set(tasks.map((task) => task._id.toString()));

  const receivedTaskIds = new Set<string>();

  for (const result of aiResults) {
    if (!validTaskIds.has(result.taskId)) {
      throw createServiceError(
        `Gemini returned an unknown task ID: ${result.taskId}`,
        500,
      );
    }

    if (receivedTaskIds.has(result.taskId)) {
      throw createServiceError(
        `Gemini returned duplicate task ID: ${result.taskId}`,
        500,
      );
    }

    receivedTaskIds.add(result.taskId);

    if (!["Low", "Medium", "High", "Critical"].includes(result.priority)) {
      throw createServiceError(
        `Gemini returned an invalid priority for task ${result.taskId}.`,
        500,
      );
    }
  }

  if (receivedTaskIds.size !== tasks.length) {
    const missingTaskIds = tasks
      .map((task) => task._id.toString())
      .filter((id) => !receivedTaskIds.has(id));

    throw createServiceError(
      `Gemini did not prioritize all tasks. Missing: ${missingTaskIds.join(", ")}`,
      500,
    );
  }

  const resultMap = new Map(aiResults.map((result) => [result.taskId, result]));

  for (const task of tasks) {
    const result = resultMap.get(task._id.toString());

    if (!result) {
      continue;
    }

    task.priority = result.priority;

    await task.save();
  }

  const updatedTasks = await Task.find({
    project: projectId,
  })
    .populate("assignedTo", "firstName lastName email role")
    .populate("createdBy", "firstName lastName email role")
    .populate("project", "name description")
    .sort({
      dueDate: 1,
      createdAt: -1,
    })
    .lean();

  const updatedNow = new Date();

  return updatedTasks.map((task: any) => {
    const aiResult = resultMap.get(task._id.toString());

    return {
      ...task,

      aiPriorityReason: aiResult?.reason || "",

      overdue:
        !!task.dueDate &&
        new Date(task.dueDate) < updatedNow &&
        task.status !== "Completed",
    };
  });
};