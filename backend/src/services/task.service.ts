import mongoose from "mongoose";

import Task from "../models/task.models";
import Project from "../models/project.models";
import Team from "../models/team.models";

import AppError from "../utils/AppError.utils";
import { ERROR_CODES } from "../types/error.types";


// =====================================================
// TASK HELPERS
// =====================================================

export const isTaskOverdue = (
  task: any,
): boolean => {

  return (
    !!task.dueDate &&
    task.status !== "Completed" &&
    new Date(task.dueDate) <
      new Date()
  );
};


export const serializeTask = (
  task: any,
) => {

  const obj =
    task.toObject
      ? task.toObject()
      : task;


  return {
    ...obj,
    overdue:
      isTaskOverdue(obj),
  };
};


// =====================================================
// PROJECT ACCESS HELPER
// =====================================================

export const canAccessTaskProject =
  async (
    projectId: string,
    userId: string,
  ): Promise<boolean> => {

    if (
      !mongoose.Types.ObjectId.isValid(
        projectId,
      )
    ) {
      throw new AppError(
        "Invalid project ID.",
        ERROR_CODES.VALIDATION_ERROR,
        400,
      );
    }


    if (
      !mongoose.Types.ObjectId.isValid(
        userId,
      )
    ) {
      throw new AppError(
        "Invalid user ID.",
        ERROR_CODES.VALIDATION_ERROR,
        400,
      );
    }


    const userObjectId =
      new mongoose.Types.ObjectId(
        userId,
      );


    const project =
      await Project.findById(
        projectId,
      ).select(
        "createdBy team",
      );


    if (!project) {
      return false;
    }


    /**
     * Project creator.
     */

    if (
      project.createdBy.toString() ===
      userId
    ) {
      return true;
    }


    /**
     * Project team.
     */

    const team =
      await Team.findById(
        project.team,
      ).select(
        "owner members",
      );


    if (!team) {
      return false;
    }


    /**
     * Project manager / team owner.
     */

    if (
      team.owner.toString() ===
      userId
    ) {
      return true;
    }


    /**
     * Team member.
     */

    return team.members.some(
      (member) =>
        member.toString() ===
        userObjectId.toString(),
    );
  };


export const requireTaskProjectAccess =
  async (
    projectId: string,
    userId: string,
  ): Promise<void> => {

    const allowed =
      await canAccessTaskProject(
        projectId,
        userId,
      );


    if (!allowed) {

      throw new AppError(
        "You do not have access to this project's tasks.",
        ERROR_CODES.FORBIDDEN,
        403,
      );
    }
  };


// =====================================================
// CREATE TASK
// =====================================================

export const createTaskService = async (
  data: any,
) => {

  if (!data.project) {

    throw new AppError(
      "Project ID is required.",
      ERROR_CODES.VALIDATION_ERROR,
      400,
    );
  }


  if (!data.createdBy) {

    throw new AppError(
      "Task creator is required.",
      ERROR_CODES.VALIDATION_ERROR,
      400,
    );
  }


  /**
   * User must have access to the
   * project before creating a task.
   */

  await requireTaskProjectAccess(
    data.project,
    data.createdBy,
  );


  const task =
    await Task.create(
      data,
    );


  return serializeTask(
    task,
  );
};


// =====================================================
// GET ALL TASKS FOR PROJECT
// =====================================================

export const getTasksService =
  async (
    projectId: string,
    userId: string,
  ) => {

    if (!projectId) {

      throw new AppError(
        "Project ID is required to fetch tasks.",
        ERROR_CODES.VALIDATION_ERROR,
        400,
      );
    }


    if (
      !mongoose.Types.ObjectId.isValid(
        projectId,
      )
    ) {

      throw new AppError(
        "Invalid project ID.",
        ERROR_CODES.VALIDATION_ERROR,
        400,
      );
    }


    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(
        userId,
      )
    ) {

      throw new AppError(
        "Invalid user ID.",
        ERROR_CODES.VALIDATION_ERROR,
        400,
      );
    }


    /**
     * IMPORTANT:
     *
     * This prevents someone from simply
     * changing ?project=OTHER_PROJECT_ID
     * and reading another project's tasks.
     */

    await requireTaskProjectAccess(
      projectId,
      userId,
    );


    const tasks =
      await Task.find({
        project:
          projectId,
      })
        .populate("project")
        .populate(
          "assignedTo",
          "firstName lastName email role",
        )
        .populate(
          "createdBy",
          "firstName lastName email role",
        )
        .sort({
          createdAt: -1,
        });


    return tasks.map(
      serializeTask,
    );
  };


// =====================================================
// GET TASK BY ID
// =====================================================

export const getTaskByIdService =
  async (
    id: string,
    userId: string,
    _userRole: string,
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        id,
      )
    ) {

      throw new AppError(
        "Invalid task ID.",
        ERROR_CODES.VALIDATION_ERROR,
        400,
      );
    }


    if (
      !mongoose.Types.ObjectId.isValid(
        userId,
      )
    ) {

      throw new AppError(
        "Invalid user ID.",
        ERROR_CODES.VALIDATION_ERROR,
        400,
      );
    }


    const task =
      await Task.findById(
        id,
      );


    if (!task) {
      return null;
    }


    /**
     * Check the project access.
     *
     * No ADMIN bypass.
     */

    await requireTaskProjectAccess(
      task.project.toString(),
      userId,
    );


    const populatedTask =
      await Task.findById(
        id,
      )
        .populate("project")
        .populate(
          "assignedTo",
          "firstName lastName email role",
        )
        .populate(
          "createdBy",
          "firstName lastName email role",
        );


    return populatedTask
      ? serializeTask(
          populatedTask,
        )
      : null;
  };


// =====================================================
// UPDATE TASK
// =====================================================

export const updateTaskService =
  async (
    id: string,
    data: any,
    userId: string,
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        id,
      )
    ) {

      throw new AppError(
        "Invalid task ID.",
        ERROR_CODES.VALIDATION_ERROR,
        400,
      );
    }


    if (
      !mongoose.Types.ObjectId.isValid(
        userId,
      )
    ) {

      throw new AppError(
        "Invalid user ID.",
        ERROR_CODES.VALIDATION_ERROR,
        400,
      );
    }


    const task =
      await Task.findById(
        id,
      );


    if (!task) {
      return null;
    }


    /**
     * User must have access to
     * the project's team.
     */

    await requireTaskProjectAccess(
      task.project.toString(),
      userId,
    );


    /**
     * Only task creator or assigned user
     * can modify the task.
     *
     * Project access alone does not
     * grant task modification rights.
     */

    if (
      task.createdBy.toString() !==
        userId &&
      task.assignedTo?.toString() !==
        userId
    ) {

      throw new AppError(
        "You are not allowed to modify this task.",
        ERROR_CODES.FORBIDDEN,
        403,
      );
    }


    const updated =
      await Task.findByIdAndUpdate(
        id,
        data,
        {
          new: true,
          runValidators: true,
        },
      )
        .populate("project")
        .populate(
          "assignedTo",
          "firstName lastName email role",
        )
        .populate(
          "createdBy",
          "firstName lastName email role",
        );


    return updated
      ? serializeTask(
          updated,
        )
      : null;
  };


// =====================================================
// DELETE TASK
// =====================================================

export const deleteTaskService =
  async (
    id: string,
    userId: string,
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        id,
      )
    ) {

      throw new AppError(
        "Invalid task ID.",
        ERROR_CODES.VALIDATION_ERROR,
        400,
      );
    }


    const task =
      await Task.findById(
        id,
      );


    if (!task) {
      return null;
    }


    await requireTaskProjectAccess(
      task.project.toString(),
      userId,
    );


    /**
     * Only task creator can delete.
     */

    if (
      task.createdBy.toString() !==
      userId
    ) {

      throw new AppError(
        "Only the task creator can delete this task.",
        ERROR_CODES.FORBIDDEN,
        403,
      );
    }


    return await Task.findByIdAndDelete(
      id,
    );
  };


// =====================================================
// KANBAN DATA
// =====================================================

export const getKanbanService =
  async (
    projectId: string,
    userId: string,
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        projectId,
      )
    ) {

      throw new AppError(
        "Invalid project ID.",
        ERROR_CODES.VALIDATION_ERROR,
        400,
      );
    }


    await requireTaskProjectAccess(
      projectId,
      userId,
    );


    const tasks =
      await Task.find({
        project:
          projectId,
      })
        .populate(
          "assignedTo",
          "firstName lastName email role",
        )
        .sort({
          createdAt: -1,
        });


    return {

      todo:
        tasks
          .filter(
            (task) =>
              task.status ===
              "Todo",
          )
          .map(
            serializeTask,
          ),

      inProgress:
        tasks
          .filter(
            (task) =>
              task.status ===
              "In Progress",
          )
          .map(
            serializeTask,
          ),

      completed:
        tasks
          .filter(
            (task) =>
              task.status ===
              "Completed",
          )
          .map(
            serializeTask,
          ),
    };
  };