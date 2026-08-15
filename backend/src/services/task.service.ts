import mongoose from "mongoose";

import Task from "../models/task.models";
import Project from "../models/project.models";
import Team from "../models/team.models";

// =====================================================
// TASK HELPERS
// =====================================================

export const isTaskOverdue = (task: any): boolean => {
  return (
    !!task.dueDate &&
    task.status !== "Completed" &&
    new Date(task.dueDate) < new Date()
  );
};

export const serializeTask = (task: any) => {
  const obj = task.toObject ? task.toObject() : task;

  return {
    ...obj,
    overdue: isTaskOverdue(obj),
  };
};

// =====================================================
// CREATE TASK
// =====================================================

export const createTaskService = async (data: any) => {
  const task = await Task.create(data);

  return serializeTask(task);
};

// =====================================================
// GET ALL TASKS FOR PROJECT
// =====================================================

export const getTasksService = async (projectId: string) => {
  if (!projectId) {
    throw new Error("Project ID is required to fetch tasks.");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID.");
  }

  const tasks = await Task.find({
    project: projectId,
  })
    .populate("project")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  return tasks.map(serializeTask);
};

// =====================================================
// GET TASK BY ID
// =====================================================

export const getTaskByIdService = async (
  id: string,
  userId: string,
  userRole: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid task ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const task = await Task.findById(id);

  if (!task) {
    return null;
  }

  // ADMIN can access any task
  if (userRole !== "ADMIN") {
    const project = await Project.findById(task.project);

    if (!project) {
      throw new Error("Task's project could not be found.");
    }

    // User must belong to the project's team
    const team = await Team.findOne({
      _id: project.team,
      members: new mongoose.Types.ObjectId(userId),
    });

    if (!team) {
      throw new Error(
        "You are not a member of this task's project team.",
      );
    }
  }

  const populatedTask = await Task.findById(id)
    .populate("project")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  return populatedTask ? serializeTask(populatedTask) : null;
};

// =====================================================
// UPDATE TASK
// =====================================================

export const updateTaskService = async (
  id: string,
  data: any,
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid task ID.");
  }

  const task = await Task.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("project")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  return task ? serializeTask(task) : null;
};

// =====================================================
// DELETE TASK
// =====================================================

export const deleteTaskService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid task ID.");
  }

  return await Task.findByIdAndDelete(id);
};

// =====================================================
// KANBAN DATA
// =====================================================

export const getKanbanService = async (
  projectId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID.");
  }

  const tasks = await Task.find({
    project: projectId,
  })
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 });

  return {
    todo: tasks
      .filter((task) => task.status === "Todo")
      .map(serializeTask),

    inProgress: tasks
      .filter((task) => task.status === "In Progress")
      .map(serializeTask),

    completed: tasks
      .filter((task) => task.status === "Completed")
      .map(serializeTask),
  };
};