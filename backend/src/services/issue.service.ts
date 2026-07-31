import Issue from "../models/issue.models";

// Create Issue
export const createIssueService = async (data: any) => {
  return await Issue.create(data);
};

// Get All Issues
export const getIssuesService = async () => {
  return await Issue.find()
    .populate("repository")
    .populate("createdBy")
    .populate("assignedTo");
};

// Get Issue By ID
export const getIssueByIdService = async (id: string) => {
  return await Issue.findById(id)
    .populate("repository")
    .populate("createdBy")
    .populate("assignedTo");
};

// Update Issue
export const updateIssueService = async (
  id: string,
  data: any
) => {
  return await Issue.findByIdAndUpdate(id, data, {
    new: true,
  });
};

// Delete Issue
export const deleteIssueService = async (id: string) => {
  return await Issue.findByIdAndDelete(id);
};