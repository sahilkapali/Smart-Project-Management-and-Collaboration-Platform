import Task from "../models/task.models";

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

// Create Task
export const createTaskService = async (data: any) => {
  const task = await Task.create(data);
  return serializeTask(task);
};

// Get All Tasks
export const getTasksService = async (projectId?: string) => {
  const query = projectId ? { project: projectId } : {};

  const tasks = await Task.find(query)
    .populate("project")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  return tasks.map(serializeTask);
};

// Get Task By ID
export const getTaskByIdService = async (id: string) => {
  const task = await Task.findById(id)
    .populate("project")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  return task ? serializeTask(task) : null;
};

// Update Task
export const updateTaskService = async (id: string, data: any) => {
  const task = await Task.findByIdAndUpdate(id, data, {
    new: true,
  })
    .populate("project")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  return task ? serializeTask(task) : null;
};

// Delete Task
export const deleteTaskService = async (id: string) => {
  return await Task.findByIdAndDelete(id);
};

// Kanban Data
export const getKanbanService = async (projectId: string) => {
  const tasks = await Task.find({ project: projectId })
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  return {
    todo: tasks
      .filter((t) => t.status === "Todo")
      .map(serializeTask),

    inProgress: tasks
      .filter((t) => t.status === "In Progress")
      .map(serializeTask),

    completed: tasks
      .filter((t) => t.status === "Completed")
      .map(serializeTask),
  };
};