import Task from "../models/task.models";

// Create Task
export const createTaskService = async (data: any) => {
  return await Task.create(data);
};

// Get All Tasks
export const getTasksService = async () => {
  return await Task.find()
    .populate("project")
    .populate("assignedTo")
    .populate("createdBy");
};

// Get Task By ID
export const getTaskByIdService = async (id: string) => {
  return await Task.findById(id)
    .populate("project")
    .populate("assignedTo")
    .populate("createdBy");
};

// Update Task
export const updateTaskService = async (
  id: string,
  data: any
) => {
  return await Task.findByIdAndUpdate(id, data, {
    new: true,
  });
};

// Delete Task
export const deleteTaskService = async (id: string) => {
  return await Task.findByIdAndDelete(id);
};