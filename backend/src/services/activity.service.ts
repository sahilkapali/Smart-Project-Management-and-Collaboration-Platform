import Activity from "../models/activity.models";

// Create Activity
export const createActivityService = async (data: any) => {
  return await Activity.create(data);
};

// Get All Activities
export const getActivitiesService = async () => {
  return await Activity.find()
    .populate("user")
    .populate("project")
    .sort({ createdAt: -1 });
};

// Get Activities for a Project
export const getProjectActivitiesService = async (projectId: string) => {
  return await Activity.find({ project: projectId })
    .populate("user")
    .populate("project")
    .sort({ createdAt: -1 });
};

// Get Activity by ID
export const getActivityByIdService = async (id: string) => {
  return await Activity.findById(id)
    .populate("user")
    .populate("project");
};

// Delete Activity
export const deleteActivityService = async (id: string) => {
  return await Activity.findByIdAndDelete(id);
};