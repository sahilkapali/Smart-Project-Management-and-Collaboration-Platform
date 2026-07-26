import { Response } from "express";
import { AuthRequest } from "../types/custom";

import {
  createTaskService,
  getTasksService,
  getTaskByIdService,
  updateTaskService,
  deleteTaskService,
} from "../services/task.service";

// Create Task
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

    // Validation
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

// Get All Tasks
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

// Get Task By ID
export const getTaskById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const task = await getTaskByIdService(req.params.id);

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

// Update Task
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

    const task = await updateTaskService(req.params.id, {
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

// Delete Task
export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const task = await deleteTaskService(req.params.id);

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