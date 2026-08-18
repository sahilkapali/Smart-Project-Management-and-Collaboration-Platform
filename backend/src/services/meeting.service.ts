import Meeting from "../models/meeting.models";
import Project from "../models/project.models";
import User from "../models/user.models";

import { createNotification } from "./notification.service";

import {
  NotificationType,
  NotificationEntityType,
} from "../types/notification.types";

import { ROLE } from "../types/user.types";

/* =====================================================
   CHECK PROJECT ACCESS
===================================================== */

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

  const isOwner = project.createdBy.toString() === userId;

  const isMember = project.members.some(
    (member) => member.toString() === userId,
  );

  /* -------------------------------------------------
     VIEW ACCESS
  ------------------------------------------------- */

  if (action === "VIEW") {
    if (isAdmin || isOwner || isMember) {
      return project;
    }

    throw new Error("PROJECT_ACCESS_DENIED");
  }

  /* -------------------------------------------------
     MANAGEMENT ACCESS
  ------------------------------------------------- */

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

/* =====================================================
   CREATE MEETING
===================================================== */

export const createMeeting = async (
  meetingData: Record<string, any>,
  userId: string,
) => {
  /*
   * Verify that the authenticated user can
   * manage the selected project.
   */
  const project = await checkProjectAccess(
    meetingData.projectId,
    userId,
    "MANAGE",
  );

  /*
   * Never trust createdBy from frontend.
   */
  const meeting = new Meeting({
    ...meetingData,
    projectId: project._id,
    createdBy: userId,
  });

  const savedMeeting = await meeting.save();

  const participants = meetingData.participants || [];

  /*
   * Notify meeting participants.
   */
  for (const participantId of participants) {
    /*
     * Don't notify creator.
     */
    if (participantId.toString() === userId.toString()) {
      continue;
    }

    await createNotification(
      participantId.toString(),

      `You have been invited to the meeting "${savedMeeting.title}".`,

      NotificationType.MEETING_INVITATION,

      userId.toString(),

      savedMeeting._id.toString(),

      NotificationEntityType.MEETING,
    );
  }

  return await Meeting.findById(savedMeeting._id)
    .populate("createdBy", "name email role avatar")
    .populate("participants", "name email role avatar");
};

/* =====================================================
   GET MEETINGS BY PROJECT
===================================================== */

export const getMeetingsByProject = async (
  projectId: string,
  userId: string,
) => {
  /*
   * Verify VIEW access.
   */
  await checkProjectAccess(projectId, userId, "VIEW");

  return await Meeting.find({
    projectId,
  })
    .populate("createdBy", "name email role avatar")
    .populate("participants", "name email role avatar")
    .sort({
      startTime: 1,
    });
};

/* =====================================================
   GET MEETING BY ID
===================================================== */

export const getMeetingById = async (id: string, userId: string) => {
  const meeting = await Meeting.findById(id);

  if (!meeting) {
    return null;
  }

  /*
   * Verify access through meeting's project.
   */
  await checkProjectAccess(meeting.projectId.toString(), userId, "VIEW");

  return await Meeting.findById(id)
    .populate("createdBy", "name email role avatar")
    .populate("participants", "name email role avatar");
};

/* =====================================================
   UPDATE MEETING
===================================================== */

export const updateMeeting = async (
  id: string,
  updateData: Record<string, any>,
  userId: string,
) => {
  const existingMeeting = await Meeting.findById(id);

  if (!existingMeeting) {
    return null;
  }

  /*
   * Verify management access to the
   * meeting's current project.
   */
  await checkProjectAccess(
    existingMeeting.projectId.toString(),
    userId,
    "MANAGE",
  );

  /*
   * If projectId is being changed,
   * verify management access to the
   * new project as well.
   */
  if (
    updateData.projectId !== undefined &&
    updateData.projectId.toString() !== existingMeeting.projectId.toString()
  ) {
    await checkProjectAccess(updateData.projectId.toString(), userId, "MANAGE");
  }

  /*
   * Don't allow createdBy to be changed.
   */
  const safeUpdateData = {
    ...updateData,
  };

  delete safeUpdateData.createdBy;

  const updatedMeeting = await Meeting.findByIdAndUpdate(id, safeUpdateData, {
    new: true,
    runValidators: true,
  })
    .populate("createdBy", "name email role avatar")
    .populate("participants", "name email role avatar");

  return updatedMeeting;
};

/* =====================================================
   DELETE MEETING
===================================================== */

export const deleteMeeting = async (id: string, userId: string) => {
  const meeting = await Meeting.findById(id);

  if (!meeting) {
    return null;
  }

  /*
   * Verify management access.
   */
  await checkProjectAccess(meeting.projectId.toString(), userId, "MANAGE");

  return await Meeting.findByIdAndDelete(id);
};

/* =====================================================
   ADD MEETING NOTES
===================================================== */

export const addMeetingNotes = async (
  meetingId: string,
  content: string,
  userId: string,
) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    return null;
  }

  /*
   * Adding notes requires project access.
   */
  await checkProjectAccess(meeting.projectId.toString(), userId, "VIEW");

  if (!meeting.notes) {
    meeting.notes = [];
  }

  meeting.notes.push({
    content,
  } as any);

  await meeting.save();

  return await Meeting.findById(meetingId)
    .populate("createdBy", "name email role avatar")
    .populate("participants", "name email role avatar");
};

/* =====================================================
   UPDATE MEETING NOTES
===================================================== */

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

  await checkProjectAccess(meeting.projectId.toString(), userId, "VIEW");

  if (!meeting.notes) {
    return undefined;
  }

  const note = meeting.notes.find(
    (item: any) => item._id?.toString() === noteId,
  );

  if (!note) {
    return undefined;
  }

  note.content = content;

  await meeting.save();

  return await Meeting.findById(meetingId)
    .populate("createdBy", "name email role avatar")
    .populate("participants", "name email role avatar");
};

/* =====================================================
   PATCH MEETING NOTES
===================================================== */

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

  await checkProjectAccess(meeting.projectId.toString(), userId, "VIEW");

  if (!meeting.notes) {
    return undefined;
  }

  const note = meeting.notes.find(
    (item: any) => item._id?.toString() === noteId,
  );

  if (!note) {
    return undefined;
  }

  if (content !== undefined) {
    note.content = content;
  }

  await meeting.save();

  return await Meeting.findById(meetingId)
    .populate("createdBy", "name email role avatar")
    .populate("participants", "name email role avatar");
};
