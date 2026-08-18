import Meeting from "../models/meeting.models";
import Project from "../models/project.models";
import User from "../models/user.models";

import { createNotification } from "./notification.service";

import {
  NotificationType,
  NotificationEntityType,
} from "../types/notification.types";

import { ROLE } from "../types/user.types";

// =====================================================
// CHECK PROJECT ACCESS
// =====================================================

const checkProjectAccess = async (
  projectId: string,
  userId: string,
  action: "VIEW" | "MANAGE",
) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const user = await User.findById(userId).select("role");

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const isAdmin = user.role === ROLE.ADMIN;

  const isOwner = project.createdBy?.toString() === userId.toString();

  const isMember = project.members?.some(
    (member) => member.toString() === userId.toString(),
  );

  // ===================================================
  // VIEW
  // ===================================================

  if (action === "VIEW") {
    if (isAdmin || isOwner || isMember) {
      return project;
    }

    throw new Error("PROJECT_ACCESS_DENIED");
  }

  // ===================================================
  // MANAGE
  // ===================================================

  if (action === "MANAGE") {
    if (isAdmin) {
      return project;
    }

    if (user.role === ROLE.PROJECT_MANAGER && (isOwner || isMember)) {
      return project;
    }

    throw new Error("PROJECT_MANAGE_DENIED");
  }

  throw new Error("PROJECT_ACCESS_DENIED");
};

// =====================================================
// POPULATE MEETING
// =====================================================

const populateMeeting = (query: any) => {
  return query
    .populate("createdBy", "name email role avatar")
    .populate("participants", "name email role avatar");
};

// =====================================================
// CREATE MEETING
// =====================================================

export const createMeeting = async (
  meetingData: Record<string, any>,
  userId: string,
) => {
  const project = await checkProjectAccess(
    meetingData.projectId,
    userId,
    "MANAGE",
  );

  const participants = Array.isArray(meetingData.participants)
    ? [...new Set(meetingData.participants.map(String))]
    : [];

  const meeting = new Meeting({
    title: meetingData.title,
    description: meetingData.description,
    meetingLink: meetingData.meetingLink,
    startTime: meetingData.startTime,
    endTime: meetingData.endTime,
    projectId: project._id,
    createdBy: userId,
    participants,
    notes: Array.isArray(meetingData.notes)
      ? meetingData.notes.map((note: any) => ({
          content: note.content,
          aiGeneratedSummary: note.aiGeneratedSummary || "",
        }))
      : [],
    actionItems: Array.isArray(meetingData.actionItems)
      ? meetingData.actionItems
      : [],
  });

  const savedMeeting = await meeting.save();

  // ===================================================
  // NOTIFICATIONS
  // ===================================================

  for (const participantId of participants) {
    if (participantId === userId.toString()) {
      continue;
    }

    await createNotification(
      participantId,
      `You have been invited to the meeting "${savedMeeting.title}".`,
      NotificationType.MEETING_INVITATION,
      userId.toString(),
      savedMeeting._id.toString(),
      NotificationEntityType.MEETING,
    );
  }

  return await populateMeeting(Meeting.findById(savedMeeting._id));
};

// =====================================================
// GET MEETINGS BY PROJECT
// =====================================================

export const getMeetingsByProject = async (
  projectId: string,
  userId: string,
) => {
  await checkProjectAccess(projectId, userId, "VIEW");

  return await populateMeeting(
    Meeting.find({
      projectId,
    }).sort({
      startTime: 1,
    }),
  );
};

// =====================================================
// GET MEETING BY ID
// =====================================================

export const getMeetingById = async (id: string, userId: string) => {
  const meeting = await Meeting.findById(id);

  if (!meeting) {
    return null;
  }

  await checkProjectAccess(meeting.projectId.toString(), userId, "VIEW");

  return await populateMeeting(Meeting.findById(id));
};

// =====================================================
// UPDATE MEETING
// =====================================================

export const updateMeeting = async (
  id: string,
  updateData: Record<string, any>,
  userId: string,
) => {
  const existingMeeting = await Meeting.findById(id);

  if (!existingMeeting) {
    return null;
  }

  await checkProjectAccess(
    existingMeeting.projectId.toString(),
    userId,
    "MANAGE",
  );

  // ===================================================
  // PROJECT CHANGE
  // ===================================================

  if (
    updateData.projectId !== undefined &&
    updateData.projectId.toString() !== existingMeeting.projectId.toString()
  ) {
    await checkProjectAccess(updateData.projectId.toString(), userId, "MANAGE");
  }

  // ===================================================
  // NEVER ALLOW CREATEDBY CHANGE
  // ===================================================

  const safeUpdateData = {
    ...updateData,
  };

  delete safeUpdateData.createdBy;
  delete safeUpdateData._id;

  // ===================================================
  // UPDATE
  // ===================================================

  const updatedMeeting = await Meeting.findByIdAndUpdate(
    id,
    {
      $set: safeUpdateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedMeeting) {
    return null;
  }

  return await populateMeeting(Meeting.findById(updatedMeeting._id));
};

// =====================================================
// DELETE MEETING
// =====================================================

export const deleteMeeting = async (id: string, userId: string) => {
  const meeting = await Meeting.findById(id);

  if (!meeting) {
    return null;
  }

  await checkProjectAccess(meeting.projectId.toString(), userId, "MANAGE");

  return await Meeting.findByIdAndDelete(id);
};

// =====================================================
// ADD MEETING NOTE
// =====================================================

export const addMeetingNotes = async (
  meetingId: string,
  content: string,
  userId: string,
) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    return null;
  }

  await checkProjectAccess(meeting.projectId.toString(), userId, "MANAGE");

  meeting.notes.push({
    content: content.trim(),
    aiGeneratedSummary: "",
  });

  await meeting.save();

  return await populateMeeting(Meeting.findById(meetingId));
};

// =====================================================
// UPDATE MEETING NOTE
// =====================================================

export const updateMeetingNotes = async (
  meetingId: string,
  noteId: string,
  content: string,
  userId: string,
) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    return null;
  }

  await checkProjectAccess(meeting.projectId.toString(), userId, "MANAGE");

  const note = meeting.notes.find(
    (item: any) => item._id?.toString() === noteId,
  );

  if (!note) {
    return undefined;
  }

  note.content = content.trim();

  await meeting.save();

  return await populateMeeting(Meeting.findById(meetingId));
};

// =====================================================
// PATCH MEETING NOTE
// =====================================================

export const patchMeetingNotes = async (
  meetingId: string,
  noteId: string,
  content: string | undefined,
  userId: string,
) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    return null;
  }

  await checkProjectAccess(meeting.projectId.toString(), userId, "MANAGE");

  const note = meeting.notes.find(
    (item: any) => item._id?.toString() === noteId,
  );

  if (!note) {
    return undefined;
  }

  if (content !== undefined) {
    note.content = content.trim();
  }

  await meeting.save();

  return await populateMeeting(Meeting.findById(meetingId));
};
