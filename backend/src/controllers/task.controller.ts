import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/custom";
import Task from "../models/task.models";

import {
  createTaskService,
  getTasksService,
  getTaskByIdService,
  updateTaskService,
  deleteTaskService,
} from "../services/task.service";

import * as aiService from "../services/gemini.service";

// ================= CREATE TASK =================
export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      project,
      title,
      description,
      assignedTo,
      dueDate,
    } = req.body;

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
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= GET ALL TASKS =================
export const getTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tasks = await getTasksService();

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= GET TASK BY ID =================
export const getTaskById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const task = await getTaskByIdService(id);

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
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= UPDATE TASK =================
export const updateTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      status,
      assignedTo,
      dueDate,
    } = req.body;

    if (!title) {
      res.status(400).json({
        success: false,
        message: "Task title is required.",
      });
      return;
    }

    const id = req.params.id as string;

    const task = await updateTaskService(id, {
      title,
      description,
      status,
      assignedTo,
      dueDate,
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: task,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= DELETE TASK =================
export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const task = await deleteTaskService(id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= UPDATE KANBAN STATUS =================
export const updateKanbanStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
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
      message: "Task status updated successfully.",
      data: task,
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADD COMMENT =================
export const addTaskComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });
      return;
    }

    await task.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: task,
    });
  } catch (err) {
    next(err);
  }
};

// ================= AUTO PRIORITIZE TASK (AI) =================
export const autoPrioritizeTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    // 1. Fetch the existing task
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found.",
      });
      return;
    }

    
    const aiPriority = await aiService.suggestTaskPriority(task.title, task.description || "");

    
    task.priority = aiPriority as "low" | "medium" | "high" | "critical";
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