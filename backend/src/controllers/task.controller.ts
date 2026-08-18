import { Response, NextFunction } from "express";

import { AuthRequest } from "../types/custom";

import Task from "../models/task.models";
import TaskComment from "../models/taskComment.models";

import {
  createTaskService,
  getTasksService,
  getTaskByIdService,
  updateTaskService,
  deleteTaskService,
  getKanbanService,
  requireTaskProjectAccess,
} from "../services/task.service";

import * as aiService from "../services/gemini.service";

// ============================================================
// CREATE TASK
// ============================================================

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

      return;
    }

    const { project, title, description, assignedTo, dueDate, priority } =
      req.body;

    if (!project || !title) {
      res.status(400).json({
        success: false,
        message: "Project and Task title are required.",
      });

      return;
    }

    const task = await createTaskService({
      project,
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET TASKS
// ============================================================

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const projectId = req.query.project as string | undefined;

    const userId = req.user?.id;

    if (!projectId) {
      res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });

      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

      return;
    }

    const tasks = await getTasksService(projectId, userId);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SINGLE TASK
// ============================================================

export const getTaskById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

      return;
    }

    const task = await getTaskByIdService(
      req.params.id,
      userId,
      req.user?.role,
    );

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE TASK
// ============================================================

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

      return;
    }

    const updated = await updateTaskService(req.params.id, req.body, userId);

    if (!updated) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE TASK
// ============================================================

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

      return;
    }

    const deleted = await deleteTaskService(req.params.id, userId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });

      return;
    }

    // Delete task comments
    await TaskComment.deleteMany({
      task: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE KANBAN STATUS
// ============================================================

export const updateKanbanStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

      return;
    }

    const { status } = req.body;

    const allowedStatuses = ["Todo", "In Progress", "Completed"];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid task status.",
      });

      return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });

      return;
    }

    await requireTaskProjectAccess(task.project.toString(), userId);

    const isCreator = task.createdBy.toString() === userId;

    const isAssignee = task.assignedTo?.toString() === userId;

    if (!isCreator && !isAssignee) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to modify this task.",
      });

      return;
    }

    task.status = status;

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

    res.status(200).json({
      success: true,
      message: "Task status updated successfully.",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET KANBAN
// ============================================================

export const getKanban = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

      return;
    }

    const board = await getKanbanService(req.params.projectId, userId);

    res.status(200).json({
      success: true,
      data: board,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ADD COMMENT
// ============================================================

export const addTaskComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

      return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });

      return;
    }

    await requireTaskProjectAccess(task.project.toString(), userId);

    const text = req.body.text?.trim();

    if (!text) {
      res.status(400).json({
        success: false,
        message: "Comment text is required.",
      });

      return;
    }

    const comment = await TaskComment.create({
      task: task._id,
      user: userId,
      text,
    });

    await comment.populate("user", "firstName lastName email role");

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET COMMENTS
// ============================================================

export const getTaskComments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

      return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });

      return;
    }

    await requireTaskProjectAccess(task.project.toString(), userId);

    const comments = await TaskComment.find({
      task: task._id,
    })
      .populate("user", "firstName lastName email role")
      .sort({
        createdAt: 1,
      });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE COMMENT
// ============================================================

export const deleteTaskComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

      return;
    }

    const comment = await TaskComment.findById(req.params.commentId);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found.",
      });

      return;
    }

    const task = await Task.findById(comment.task);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });

      return;
    }

    await requireTaskProjectAccess(task.project.toString(), userId);

    if (comment.user.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: "Not allowed to delete this comment.",
      });

      return;
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// AI PRIORITIZATION
// ============================================================

export const autoPrioritizeTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });

      return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });

      return;
    }

    await requireTaskProjectAccess(task.project.toString(), userId);

    const taskContext = `
Task Title: ${task.title}

Description:
${task.description || "No description provided"}

Due Date:
${task.dueDate ? new Date(task.dueDate).toISOString() : "No due date"}

Status:
${task.status}

Current Priority:
${task.priority}
`;

    const aiPriority = await aiService.generateTaskPriority(taskContext);

    const normalizedPriority =
      String(aiPriority)
        .trim()
        .replace(/[^a-zA-Z]/g, "")
        .charAt(0)
        .toUpperCase() +
      String(aiPriority)
        .trim()
        .replace(/[^a-zA-Z]/g, "")
        .slice(1)
        .toLowerCase();

    const allowedPriorities = ["Low", "Medium", "High", "Critical"];

    if (!allowedPriorities.includes(normalizedPriority)) {
      res.status(500).json({
        success: false,
        message: "AI returned an invalid task priority.",
      });

      return;
    }

    task.priority = normalizedPriority as
      | "Low"
      | "Medium"
      | "High"
      | "Critical";

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

    res.status(200).json({
      success: true,
      message: `Task priority auto-updated to ${normalizedPriority}.`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};
