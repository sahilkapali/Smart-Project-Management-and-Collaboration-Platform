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
} from "../services/task.service";

import * as aiService from "../services/gemini.service";

export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
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
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTasks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const projectId = req.query.project as string | undefined;

    if (!projectId) {
      res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
      return;
    }

    const tasks = await getTasksService(projectId);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTaskById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. User information not found.",
      });
      return;
    }

    const task = await getTaskByIdService(
      req.params.id,
      userId,
      userRole as string,
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
  } catch (err: any) {
    const message = err.message || "Failed to retrieve task.";

    if (message.includes("not a member") || message.includes("permission")) {
      res.status(403).json({
        success: false,
        message,
      });
      return;
    }

    if (message.includes("Invalid")) {
      res.status(400).json({
        success: false,
        message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: "Task not found." });
      return;
    }

    // Authorization: creator or assignee
    if (
      task.createdBy.toString() !== req.user?.id &&
      task.assignedTo?.toString() !== req.user?.id
    ) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to modify this task.",
      });
      return;
    }

    const updated = await updateTaskService(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= DELETE TASK =================
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: "Task not found." });
      return;
    }

    if (task.createdBy.toString() !== req.user?.id) {
      res.status(403).json({
        success: false,
        message: "Only the task creator can delete this task.",
      });
      return;
    }

    await TaskComment.deleteMany({ task: task._id });
    await deleteTaskService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= UPDATE KANBAN STATUS =================
export const updateKanbanStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status } = req.body;

    if (!["Todo", "In Progress", "Completed"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid task status.",
      });
      return;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!task) {
      res.status(404).json({ success: false, message: "Task not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Task status updated successfully.",
      data: task,
    });
  } catch (err) {
    next(err);
  }
};

export const getKanban = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const board = await getKanbanService(req.params.projectId);

    res.status(200).json({
      success: true,
      data: board,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addTaskComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: "Task not found." });
      return;
    }

    if (!req.body.text?.trim()) {
      res.status(400).json({
        success: false,
        message: "Comment text is required.",
      });
      return;
    }

    const comment = await TaskComment.create({
      task: task._id,
      user: req.user?.id,
      text: req.body.text,
    });

    const populated = await comment.populate("user", "name email role");

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const getTaskComments = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const comments = await TaskComment.find({ task: req.params.id })
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

export const deleteTaskComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const comment = await TaskComment.findById(req.params.commentId);

    if (!comment) {
      res.status(404).json({ success: false, message: "Comment not found." });
      return;
    }

    if (comment.user.toString() !== req.user?.id) {
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
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const autoPrioritizeTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: "Task not found." });
      return;
    }

    const taskContext = `
Task Title: ${task.title}
Description: ${task.description || "No description provided"}
Due Date: ${task.dueDate ? new Date(task.dueDate).toISOString() : "No due date"}
Status: ${task.status || "Not specified"}
Current Priority: ${task.priority || "Not assigned"}
`;

    const aiPriority = await aiService.generateTaskPriority(taskContext);

    const normalizedPriority =
      aiPriority.charAt(0).toUpperCase() + aiPriority.slice(1).toLowerCase();

    if (!["Low", "Medium", "High", "Critical"].includes(normalizedPriority)) {
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

    res.status(200).json({
      success: true,
      message: `Task priority auto-updated to ${aiPriority}`,
      data: task,
    });
  } catch (err) {
    next(err);
  }
};
