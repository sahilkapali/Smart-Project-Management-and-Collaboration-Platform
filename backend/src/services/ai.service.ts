import mongoose from "mongoose";

import AIOutput, { AIOutputType } from "../models/ai.models";

import Task from "../models/task.models";
import Meeting from "../models/meeting.models";
import Project from "../models/project.models";

import {
  generateProjectInsight,
  generateProjectReportSummary,
  prioritizeTask,
  generateMeetingSummary,
  generateActionItems,
} from "./gemini.service";

// =====================================================
// OBJECT ID VALIDATION
// =====================================================

const validateObjectId = (id: string, fieldName: string): void => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`INVALID_${fieldName.toUpperCase()}_ID`);
  }
};

// =====================================================
// SAVE AI OUTPUT
// =====================================================

const saveAIOutput = async (data: {
  type: AIOutputType;
  userId: string;
  prompt: string;
  output: string;
  projectId?: string;
  taskId?: string;
  meetingId?: string;
}) => {
  validateObjectId(data.userId, "user");

  if (data.projectId) {
    validateObjectId(data.projectId, "project");
  }

  if (data.taskId) {
    validateObjectId(data.taskId, "task");
  }

  if (data.meetingId) {
    validateObjectId(data.meetingId, "meeting");
  }

  return AIOutput.create({
    type: data.type,

    user: new mongoose.Types.ObjectId(data.userId),

    project: data.projectId
      ? new mongoose.Types.ObjectId(data.projectId)
      : undefined,

    task: data.taskId ? new mongoose.Types.ObjectId(data.taskId) : undefined,

    meeting: data.meetingId
      ? new mongoose.Types.ObjectId(data.meetingId)
      : undefined,

    prompt: data.prompt,

    output: data.output,
  });
};

// =====================================================
// GENERAL PROJECT INSIGHT
// =====================================================

export const createProjectInsight = async (
  projectId: string,
  userId: string,
) => {
  validateObjectId(projectId, "project");
  validateObjectId(userId, "user");

  const project = await Project.findById(projectId)
    .populate("createdBy", "firstName lastName email role")
    .populate("members", "firstName lastName email role");

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const projectContext = JSON.stringify({
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: project.startDate,
    dueDate: project.dueDate,
    createdBy: project.createdBy,
    members: project.members,
  });

  const output = await generateProjectInsight(projectContext);

  const saved = await saveAIOutput({
    type: AIOutputType.INSIGHT,
    userId,
    projectId,
    prompt: projectContext,
    output,
  });

  return saved;
};

// =====================================================
// AI PROJECT REPORT SUMMARY
// =====================================================

export const createProjectReportSummary = async (
  projectId: string,
  userId: string,
  reportData: {
    project: {
      name: string;
      description?: string;
      status?: string;
      startDate?: Date | string;
      dueDate?: Date | string;
      membersCount: number;
    };

    repositoriesCount: number;

    taskStats: {
      total: number;
      completed: number;
      inProgress: number;
      todo: number;
    };

    issueStats: {
      total: number;
      open: number;
      inProgress: number;
      resolved: number;
    };
  },
) => {
  validateObjectId(projectId, "project");
  validateObjectId(userId, "user");

  const taskCompletionPercentage =
    reportData.taskStats.total > 0
      ? Math.round(
          (reportData.taskStats.completed / reportData.taskStats.total) * 100,
        )
      : 0;

  const issueResolutionPercentage =
    reportData.issueStats.total > 0
      ? Math.round(
          (reportData.issueStats.resolved / reportData.issueStats.total) * 100,
        )
      : 0;

  const reportContext = JSON.stringify({
    project: {
      name: reportData.project.name,
      description: reportData.project.description,
      status: reportData.project.status,
      startDate: reportData.project.startDate,
      dueDate: reportData.project.dueDate,
      membersCount: reportData.project.membersCount,
    },

    repositoriesCount: reportData.repositoriesCount,

    tasks: {
      total: reportData.taskStats.total,
      completed: reportData.taskStats.completed,
      inProgress: reportData.taskStats.inProgress,
      todo: reportData.taskStats.todo,
      completionPercentage: taskCompletionPercentage,
    },

    issues: {
      total: reportData.issueStats.total,
      open: reportData.issueStats.open,
      inProgress: reportData.issueStats.inProgress,
      resolved: reportData.issueStats.resolved,
      resolutionPercentage: issueResolutionPercentage,
    },
  });

  const output = await generateProjectReportSummary(reportContext);

  const saved = await saveAIOutput({
    type: AIOutputType.INSIGHT,
    userId,
    projectId,
    prompt: reportContext,
    output,
  });

  return saved;
};

// =====================================================
// TASK PRIORITIZATION
// =====================================================

export const prioritizeTaskByAI = async (taskId: string, userId: string) => {
  validateObjectId(taskId, "task");
  validateObjectId(userId, "user");

  const task = await Task.findById(taskId)
    .populate("project")
    .populate("assignedTo", "firstName lastName email role");

  if (!task) {
    throw new Error("TASK_NOT_FOUND");
  }

  const taskContext = JSON.stringify({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    assignedTo: task.assignedTo,
    project: task.project,
  });

  const output = await prioritizeTask(taskContext);

  let projectId: string;

  if (
    task.project &&
    typeof task.project === "object" &&
    "_id" in task.project
  ) {
    projectId = String((task.project as any)._id);
  } else {
    projectId = String(task.project);
  }

  validateObjectId(projectId, "project");

  const saved = await saveAIOutput({
    type: AIOutputType.TASK_PRIORITY,
    userId,
    taskId,
    projectId,
    prompt: taskContext,
    output,
  });

  return saved;
};

// =====================================================
// MEETING NOTES -> TEXT
// =====================================================

const getMeetingText = (meeting: any): string => {
  /*
   * Meeting notes are stored as an array:
   *
   * notes: [
   *   {
   *     content: "...",
   *     aiGeneratedSummary: "..."
   *   }
   * ]
   *
   * Gemini expects a string, so convert all note
   * contents into one text block.
   */

  if (Array.isArray(meeting.notes)) {
    return meeting.notes
      .map((note: any) => {
        if (!note) {
          return "";
        }

        if (typeof note.content === "string") {
          return note.content.trim();
        }

        return "";
      })
      .filter((content: string) => content.length > 0)
      .join("\n\n---\n\n");
  }

  /*
   * Keep transcript support in case your Meeting model
   * contains a transcript field.
   */

  if (typeof meeting.transcript === "string") {
    return meeting.transcript.trim();
  }

  return "";
};

// =====================================================
// MEETING SUMMARY
// =====================================================

export const summarizeMeeting = async (meetingId: string, userId: string) => {
  validateObjectId(meetingId, "meeting");
  validateObjectId(userId, "user");

  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    throw new Error("MEETING_NOT_FOUND");
  }

  /*
   * IMPORTANT:
   * meeting.notes is a Mongoose DocumentArray.
   * It cannot be passed directly to .trim() or Gemini.
   *
   * Convert it into a plain string first.
   */

  const meetingText = getMeetingText(meeting);

  if (!meetingText.trim()) {
    throw new Error("MEETING_NOTES_REQUIRED");
  }

  const output = await generateMeetingSummary(meetingText);

  const saved = await saveAIOutput({
    type: AIOutputType.MEETING_SUMMARY,
    userId,
    meetingId,
    prompt: meetingText,
    output,
  });

  return saved;
};

// =====================================================
// MEETING ACTION ITEMS
// =====================================================

export const extractMeetingActionItems = async (
  meetingId: string,
  userId: string,
) => {
  validateObjectId(meetingId, "meeting");
  validateObjectId(userId, "user");

  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    throw new Error("MEETING_NOT_FOUND");
  }

  /*
   * Convert the meeting notes array into a string
   * before sending it to Gemini.
   */

  const meetingText = getMeetingText(meeting);

  if (!meetingText.trim()) {
    throw new Error("MEETING_NOTES_REQUIRED");
  }

  const output = await generateActionItems(meetingText);

  const saved = await saveAIOutput({
    type: AIOutputType.ACTION_ITEMS,
    userId,
    meetingId,
    prompt: meetingText,
    output,
  });

  return saved;
};

// =====================================================
// GET STORED PROJECT AI OUTPUTS
// =====================================================

export const getProjectAIOutputs = async (
  projectId: string,
  userId: string,
) => {
  validateObjectId(projectId, "project");
  validateObjectId(userId, "user");

  return AIOutput.find({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  })
    .populate("task", "title status priority")
    .populate("meeting", "title date")
    .sort({ createdAt: -1 });
};

// =====================================================
// GET STORED TASK AI OUTPUTS
// =====================================================

export const getTaskAIOutputs = async (taskId: string, userId: string) => {
  validateObjectId(taskId, "task");
  validateObjectId(userId, "user");

  return AIOutput.find({
    task: new mongoose.Types.ObjectId(taskId),
    user: new mongoose.Types.ObjectId(userId),
  }).sort({
    createdAt: -1,
  });
};

// =====================================================
// GET STORED MEETING AI OUTPUTS
// =====================================================

export const getMeetingAIOutputs = async (
  meetingId: string,
  userId: string,
) => {
  validateObjectId(meetingId, "meeting");
  validateObjectId(userId, "user");

  return AIOutput.find({
    meeting: new mongoose.Types.ObjectId(meetingId),
    user: new mongoose.Types.ObjectId(userId),
  }).sort({
    createdAt: -1,
  });
};
