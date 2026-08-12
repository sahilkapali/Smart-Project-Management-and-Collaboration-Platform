import mongoose from 'mongoose';

import AIOutput, {
  AIOutputType
} from '../models/ai.models';

import Task from '../models/task.models';
import Meeting from '../models/meeting.models';
import Project from '../models/project.models';

import {
  generateProjectInsight,
  prioritizeTask,
  generateMeetingSummary,
  generateActionItems
} from './gemini.service';


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

  return AIOutput.create({
    type: data.type,

    user: data.userId,

    project: data.projectId
      ? new mongoose.Types.ObjectId(data.projectId)
      : undefined,

    task: data.taskId
      ? new mongoose.Types.ObjectId(data.taskId)
      : undefined,

    meeting: data.meetingId
      ? new mongoose.Types.ObjectId(data.meetingId)
      : undefined,

    prompt: data.prompt,

    output: data.output
  });
};


// =====================================================
// GENERAL PROJECT INSIGHT
// =====================================================

export const createProjectInsight = async (
  projectId: string,
  userId: string
) => {

  const project = await Project.findById(projectId)
    .populate('owner', 'name email')
    .populate('members', 'name email');

  if (!project) {
    throw new Error('PROJECT_NOT_FOUND');
  }

  const projectContext = JSON.stringify({
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: project.startDate,
    dueDate: project.dueDate,
    owner: project.owner,
    members: project.members
  });

  const output =
    await generateProjectInsight(projectContext);

  const saved = await saveAIOutput({
    type: AIOutputType.INSIGHT,
    userId,
    projectId,
    prompt: projectContext,
    output
  });

  return saved;
};


// =====================================================
// TASK PRIORITIZATION
// =====================================================

export const prioritizeTaskByAI = async (
  taskId: string,
  userId: string
) => {

  const task = await Task.findById(taskId)
    .populate('project')
    .populate('assignedTo', 'name email');

  if (!task) {
    throw new Error('TASK_NOT_FOUND');
  }

  const taskContext = JSON.stringify({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    assignedTo: task.assignedTo,
    project: task.project
  });

  const output =
    await prioritizeTask(taskContext);

  const projectId =
    task.project &&
    typeof task.project === 'object' &&
    '_id' in task.project
      ? String((task.project as any)._id)
      : String(task.project);

  const saved = await saveAIOutput({
    type: AIOutputType.TASK_PRIORITY,
    userId,
    taskId,
    projectId,
    prompt: taskContext,
    output
  });

  return saved;
};


// =====================================================
// MEETING SUMMARY
// =====================================================

export const summarizeMeeting = async (
  meetingId: string,
  userId: string
) => {

  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    throw new Error('MEETING_NOT_FOUND');
  }

  const meetingText =
    meeting.notes ||
    (meeting as any).transcript ||
    '';

  if (!meetingText.trim()) {
    throw new Error(
      'MEETING_NOTES_REQUIRED'
    );
  }

  const output =
    await generateMeetingSummary(meetingText);

  const saved = await saveAIOutput({
    type: AIOutputType.MEETING_SUMMARY,
    userId,
    meetingId,
    prompt: meetingText,
    output
  });

  return saved;
};


// =====================================================
// MEETING ACTION ITEMS
// =====================================================

export const extractMeetingActionItems = async (
  meetingId: string,
  userId: string
) => {

  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    throw new Error('MEETING_NOT_FOUND');
  }

  const meetingText =
    meeting.notes ||
    (meeting as any).transcript ||
    '';

  if (!meetingText.trim()) {
    throw new Error(
      'MEETING_NOTES_REQUIRED'
    );
  }

  const output =
    await generateActionItems(meetingText);

  const saved = await saveAIOutput({
    type: AIOutputType.ACTION_ITEMS,
    userId,
    meetingId,
    prompt: meetingText,
    output
  });

  return saved;
};


// =====================================================
// GET STORED AI OUTPUTS
// =====================================================

export const getProjectAIOutputs = async (
  projectId: string,
  userId: string
) => {

  return AIOutput.find({
    project: projectId,
    user: userId
  })
    .populate('task', 'title status priority')
    .populate('meeting', 'title date')
    .sort({ createdAt: -1 });
};


export const getTaskAIOutputs = async (
  taskId: string,
  userId: string
) => {

  return AIOutput.find({
    task: taskId,
    user: userId
  })
    .sort({ createdAt: -1 });
};


export const getMeetingAIOutputs = async (
  meetingId: string,
  userId: string
) => {

  return AIOutput.find({
    meeting: meetingId,
    user: userId
  })
    .sort({ createdAt: -1 });
};