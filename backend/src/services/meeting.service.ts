import Meeting from "../models/meeting.models";
import Project from "../models/project.models";
import User from "../models/user.models";

import { createNotification } from "./notification.service";

import {
  NotificationType,
  NotificationEntityType,
} from "../types/notification.types";

import { ROLE } from "../types/user.types";

// ============================================================
// TYPES
// ============================================================

type ProjectAction = "VIEW" | "MANAGE";

interface ProjectAccessResult {
  project: any;
  user: any;
  isAdmin: boolean;
  isProjectManager: boolean;
  isProjectOwner: boolean;
  isProjectMember: boolean;
}

// ============================================================
// GET USER
// ============================================================

const getAuthenticatedUser = async (userId: string) => {
  const user = await User.findById(userId).select(
    "_id name email role avatar",
  );

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};

// ============================================================
// CHECK PROJECT ACCESS
// ============================================================
//
// RBAC:
//
// ADMIN
//   -> Full access
//
// PROJECT_MANAGER
//   -> Can manage meetings in projects they own/manage
//   -> Can view meetings in projects they belong to
//
// TEAM_MEMBER
//   -> Can view meetings in projects they belong to
//   -> Cannot create/update/delete meetings
//   -> Cannot modify meeting notes
//
// ============================================================

const checkProjectAccess = async (
  projectId: string,
  userId: string,
  action: ProjectAction,
): Promise<ProjectAccessResult> => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const user = await getAuthenticatedUser(userId);

  const role = String(user.role ?? "").toUpperCase();

  const isAdmin =
    role === String(ROLE.ADMIN).toUpperCase() ||
    role === "ADMIN" ||
    role === "SUPER_ADMIN" ||
    role === "SUPERADMIN";

  const isProjectManager =
    role === String(ROLE.PROJECT_MANAGER).toUpperCase() ||
    role === "PROJECT_MANAGER" ||
    role === "PROJECTMANAGER";

  const isTeamMember =
    role === String(ROLE.TEAM_MEMBER).toUpperCase() ||
    role === "TEAM_MEMBER" ||
    role === "TEAMMEMBER";

  const isProjectOwner =
    project.createdBy?.toString() === userId.toString();

  const isProjectMember =
    Array.isArray(project.members) &&
    project.members.some(
      (member: any) => member?.toString() === userId.toString(),
    );

  // ==========================================================
  // ADMIN
  // ==========================================================

  if (isAdmin) {
    return {
      project,
      user,
      isAdmin: true,
      isProjectManager: false,
      isProjectOwner,
      isProjectMember,
    };
  }

  // ==========================================================
  // VIEW
  // ==========================================================
  //
  // Project Manager:
  //   Can view meetings if they own or belong to project.
  //
  // Team Member:
  //   Can view meetings if they belong to project.
  //
  // ==========================================================

  if (action === "VIEW") {
    if (isProjectManager && (isProjectOwner || isProjectMember)) {
      return {
        project,
        user,
        isAdmin: false,
        isProjectManager: true,
        isProjectOwner,
        isProjectMember,
      };
    }

    if (isTeamMember && isProjectMember) {
      return {
        project,
        user,
        isAdmin: false,
        isProjectManager: false,
        isProjectOwner,
        isProjectMember,
      };
    }

    throw new Error("PROJECT_ACCESS_DENIED");
  }

  // ==========================================================
  // MANAGE
  // ==========================================================
  //
  // Only:
  //
  // ADMIN
  // PROJECT_MANAGER
  //
  // Team members cannot manage meetings.
  //
  // ==========================================================

  if (action === "MANAGE") {
    if (isProjectManager && (isProjectOwner || isProjectMember)) {
      return {
        project,
        user,
        isAdmin: false,
        isProjectManager: true,
        isProjectOwner,
        isProjectMember,
      };
    }

    throw new Error("PROJECT_MANAGE_DENIED");
  }

  throw new Error("PROJECT_ACCESS_DENIED");
};

// ============================================================
// CHECK TARGET PROJECT FOR PROJECT CHANGE
// ============================================================

const checkTargetProjectForChange = async (
  projectId: string,
  userId: string,
) => {
  return checkProjectAccess(projectId, userId, "MANAGE");
};

// ============================================================
// POPULATE MEETING
// ============================================================

const populateMeeting = (query: any) => {
  return query
    .populate("createdBy", "name email role avatar")
    .populate("participants", "name email role avatar")
    .populate("projectId", "name description createdBy members");
};

// ============================================================
// VALIDATE PARTICIPANTS
// ============================================================
//
// Participants should belong to the project.
//
// This prevents a project manager from inviting completely
// unrelated users to a project meeting.
//
// ADMIN is allowed to bypass this restriction.
//
// ============================================================

const validateParticipants = async (
  project: any,
  participants: string[],
  userId: string,
) => {
  const user = await getAuthenticatedUser(userId);

  const role = String(user.role ?? "").toUpperCase();

  const isAdmin =
    role === String(ROLE.ADMIN).toUpperCase() ||
    role === "ADMIN" ||
    role === "SUPER_ADMIN" ||
    role === "SUPERADMIN";

  if (isAdmin) {
    return;
  }

  const projectMemberIds = new Set(
    [
      project.createdBy?.toString(),
      ...(Array.isArray(project.members)
        ? project.members.map((member: any) => member.toString())
        : []),
    ].filter(Boolean),
  );

  for (const participantId of participants) {
    if (!projectMemberIds.has(participantId.toString())) {
      throw new Error("PARTICIPANT_NOT_PROJECT_MEMBER");
    }
  }
};

// ============================================================
// CREATE MEETING
// ============================================================

export const createMeeting = async (
  meetingData: Record<string, any>,
  userId: string,
) => {
  // ==========================================================
  // REQUIRED PROJECT
  // ==========================================================

  if (!meetingData.projectId) {
    throw new Error("PROJECT_ID_REQUIRED");
  }

  // ==========================================================
  // PROJECT RBAC
  // ==========================================================

  const access = await checkProjectAccess(
    meetingData.projectId.toString(),
    userId,
    "MANAGE",
  );

  const project = access.project;

  // ==========================================================
  // PARTICIPANTS
  // ==========================================================

  const participants = Array.isArray(meetingData.participants)
    ? [...new Set(meetingData.participants.map(String))]
    : [];

  await validateParticipants(project, participants, userId);

  // ==========================================================
  // VALIDATE TITLE
  // ==========================================================

  if (
    typeof meetingData.title !== "string" ||
    !meetingData.title.trim()
  ) {
    throw new Error("MEETING_TITLE_REQUIRED");
  }

  // ==========================================================
  // VALIDATE START TIME
  // ==========================================================

  if (!meetingData.startTime) {
    throw new Error("MEETING_START_TIME_REQUIRED");
  }

  const startTime = new Date(meetingData.startTime);

  if (Number.isNaN(startTime.getTime())) {
    throw new Error("INVALID_MEETING_START_TIME");
  }

  // ==========================================================
  // VALIDATE END TIME
  // ==========================================================

  let endTime: Date | undefined;

  if (meetingData.endTime) {
    endTime = new Date(meetingData.endTime);

    if (Number.isNaN(endTime.getTime())) {
      throw new Error("INVALID_MEETING_END_TIME");
    }

    if (endTime <= startTime) {
      throw new Error("MEETING_END_TIME_MUST_BE_AFTER_START_TIME");
    }
  }

  // ==========================================================
  // CREATE MEETING
  // ==========================================================

  const meeting = new Meeting({
    title: meetingData.title.trim(),

    description:
      typeof meetingData.description === "string"
        ? meetingData.description.trim()
        : "",

    meetingLink:
      typeof meetingData.meetingLink === "string"
        ? meetingData.meetingLink.trim()
        : "",

    startTime,

    endTime,

    projectId: project._id,

    createdBy: userId,

    participants,

    notes: Array.isArray(meetingData.notes)
      ? meetingData.notes
          .filter((note: any) => note?.content)
          .map((note: any) => ({
            content: String(note.content).trim(),
            aiGeneratedSummary:
              typeof note.aiGeneratedSummary === "string"
                ? note.aiGeneratedSummary.trim()
                : "",
          }))
      : [],

    actionItems: Array.isArray(meetingData.actionItems)
      ? meetingData.actionItems
          .filter(
            (item: any) =>
              typeof item === "string" && item.trim(),
          )
          .map((item: string) => item.trim())
      : [],
  });

  const savedMeeting = await meeting.save();

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  for (const participantId of participants) {
    if (participantId === userId.toString()) {
      continue;
    }

    try {
      await createNotification(
        participantId,
        `You have been invited to the meeting "${savedMeeting.title}".`,
        NotificationType.MEETING_INVITATION,
        userId.toString(),
        savedMeeting._id.toString(),
        NotificationEntityType.MEETING,
      );
    } catch (notificationError) {
      console.error(
        "Failed to create meeting notification:",
        notificationError,
      );
    }
  }

  // ==========================================================
  // RETURN
  // ==========================================================

  return await populateMeeting(
    Meeting.findById(savedMeeting._id),
  );
};

// ============================================================
// GET MEETINGS BY PROJECT
// ============================================================

export const getMeetingsByProject = async (
  projectId: string,
  userId: string,
) => {
  // ==========================================================
  // VIEW ACCESS
  // ==========================================================

  await checkProjectAccess(projectId, userId, "VIEW");

  // ==========================================================
  // GET MEETINGS
  // ==========================================================

  return await populateMeeting(
    Meeting.find({
      projectId,
    }).sort({
      startTime: 1,
    }),
  );
};

// ============================================================
// GET MEETING BY ID
// ============================================================

export const getMeetingById = async (
  id: string,
  userId: string,
) => {
  const meeting = await Meeting.findById(id);

  if (!meeting) {
    return null;
  }

  // ==========================================================
  // VIEW ACCESS
  // ==========================================================

  await checkProjectAccess(
    meeting.projectId.toString(),
    userId,
    "VIEW",
  );

  return await populateMeeting(
    Meeting.findById(id),
  );
};

// ============================================================
// UPDATE MEETING
// ============================================================

export const updateMeeting = async (
  id: string,
  updateData: Record<string, any>,
  userId: string,
) => {
  // ==========================================================
  // FIND MEETING
  // ==========================================================

  const existingMeeting = await Meeting.findById(id);

  if (!existingMeeting) {
    return null;
  }

  // ==========================================================
  // CURRENT PROJECT ACCESS
  // ==========================================================

  await checkProjectAccess(
    existingMeeting.projectId.toString(),
    userId,
    "MANAGE",
  );

  // ==========================================================
  // SAFE UPDATE DATA
  // ==========================================================

  const safeUpdateData: Record<string, any> = {
    ...updateData,
  };

  // Never allow these fields to be modified directly.

  delete safeUpdateData.createdBy;
  delete safeUpdateData._id;

  // ==========================================================
  // PROJECT CHANGE
  // ==========================================================

  if (
    safeUpdateData.projectId !== undefined &&
    safeUpdateData.projectId.toString() !==
      existingMeeting.projectId.toString()
  ) {
    await checkTargetProjectForChange(
      safeUpdateData.projectId.toString(),
      userId,
    );
  }

  // ==========================================================
  // TITLE
  // ==========================================================

  if (safeUpdateData.title !== undefined) {
    if (
      typeof safeUpdateData.title !== "string" ||
      !safeUpdateData.title.trim()
    ) {
      throw new Error("MEETING_TITLE_REQUIRED");
    }

    safeUpdateData.title = safeUpdateData.title.trim();
  }

  // ==========================================================
  // DESCRIPTION
  // ==========================================================

  if (safeUpdateData.description !== undefined) {
    safeUpdateData.description =
      typeof safeUpdateData.description === "string"
        ? safeUpdateData.description.trim()
        : "";
  }

  // ==========================================================
  // MEETING LINK
  // ==========================================================

  if (safeUpdateData.meetingLink !== undefined) {
    safeUpdateData.meetingLink =
      typeof safeUpdateData.meetingLink === "string"
        ? safeUpdateData.meetingLink.trim()
        : "";
  }

  // ==========================================================
  // START TIME
  // ==========================================================

  if (safeUpdateData.startTime !== undefined) {
    const startTime = new Date(safeUpdateData.startTime);

    if (Number.isNaN(startTime.getTime())) {
      throw new Error("INVALID_MEETING_START_TIME");
    }

    safeUpdateData.startTime = startTime;
  }

  // ==========================================================
  // END TIME
  // ==========================================================

  if (safeUpdateData.endTime !== undefined) {
    if (
      safeUpdateData.endTime === null ||
      safeUpdateData.endTime === ""
    ) {
      safeUpdateData.endTime = undefined;
    } else {
      const endTime = new Date(safeUpdateData.endTime);

      if (Number.isNaN(endTime.getTime())) {
        throw new Error("INVALID_MEETING_END_TIME");
      }

      safeUpdateData.endTime = endTime;
    }
  }

  // ==========================================================
  // PARTICIPANTS
  // ==========================================================

  if (safeUpdateData.participants !== undefined) {
    const participants = Array.isArray(
      safeUpdateData.participants,
    )
      ? [...new Set(safeUpdateData.participants.map(String))]
      : [];

    const targetProject = await Project.findById(
      safeUpdateData.projectId ??
        existingMeeting.projectId,
    );

    if (!targetProject) {
      throw new Error("PROJECT_NOT_FOUND");
    }

    await validateParticipants(
      targetProject,
      participants,
      userId,
    );

    safeUpdateData.participants = participants;
  }

  // ==========================================================
  // ACTION ITEMS
  // ==========================================================

  if (safeUpdateData.actionItems !== undefined) {
    safeUpdateData.actionItems = Array.isArray(
      safeUpdateData.actionItems,
    )
      ? safeUpdateData.actionItems
          .filter(
            (item: any) =>
              typeof item === "string" && item.trim(),
          )
          .map((item: string) => item.trim())
      : [];
  }

  // ==========================================================
  // UPDATE
  // ==========================================================

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

  // ==========================================================
  // RETURN POPULATED
  // ==========================================================

  return await populateMeeting(
    Meeting.findById(updatedMeeting._id),
  );
};

// ============================================================
// DELETE MEETING
// ============================================================

export const deleteMeeting = async (
  id: string,
  userId: string,
) => {
  const meeting = await Meeting.findById(id);

  if (!meeting) {
    return null;
  }

  // ==========================================================
  // MANAGE ACCESS
  // ==========================================================

  await checkProjectAccess(
    meeting.projectId.toString(),
    userId,
    "MANAGE",
  );

  // ==========================================================
  // DELETE
  // ==========================================================

  return await Meeting.findByIdAndDelete(id);
};

// ============================================================
// ADD MEETING NOTE
// ============================================================

export const addMeetingNotes = async (
  meetingId: string,
  content: string,
  userId: string,
) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    return null;
  }

  // ==========================================================
  // MANAGE ACCESS
  // ==========================================================

  await checkProjectAccess(
    meeting.projectId.toString(),
    userId,
    "MANAGE",
  );

  // ==========================================================
  // VALIDATE CONTENT
  // ==========================================================

  if (!content || !content.trim()) {
    throw new Error("MEETING_NOTE_CONTENT_REQUIRED");
  }

  // ==========================================================
  // ADD NOTE
  // ==========================================================

  meeting.notes.push({
    content: content.trim(),
    aiGeneratedSummary: "",
  });

  await meeting.save();

  return await populateMeeting(
    Meeting.findById(meetingId),
  );
};

// ============================================================
// UPDATE MEETING NOTE
// ============================================================

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

  // ==========================================================
  // MANAGE ACCESS
  // ==========================================================

  await checkProjectAccess(
    meeting.projectId.toString(),
    userId,
    "MANAGE",
  );

  // ==========================================================
  // FIND NOTE
  // ==========================================================

  const note = meeting.notes.find(
    (item: any) =>
      item._id?.toString() === noteId,
  );

  if (!note) {
    return undefined;
  }

  // ==========================================================
  // VALIDATE CONTENT
  // ==========================================================

  if (!content || !content.trim()) {
    throw new Error("MEETING_NOTE_CONTENT_REQUIRED");
  }

  // ==========================================================
  // UPDATE
  // ==========================================================

  note.content = content.trim();

  await meeting.save();

  return await populateMeeting(
    Meeting.findById(meetingId),
  );
};

// ============================================================
// PATCH MEETING NOTE
// ============================================================

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

  // ==========================================================
  // MANAGE ACCESS
  // ==========================================================

  await checkProjectAccess(
    meeting.projectId.toString(),
    userId,
    "MANAGE",
  );

  // ==========================================================
  // FIND NOTE
  // ==========================================================

  const note = meeting.notes.find(
    (item: any) =>
      item._id?.toString() === noteId,
  );

  if (!note) {
    return undefined;
  }

  // ==========================================================
  // PATCH CONTENT
  // ==========================================================

  if (content !== undefined) {
    if (!content.trim()) {
      throw new Error("MEETING_NOTE_CONTENT_REQUIRED");
    }

    note.content = content.trim();
  }

  await meeting.save();

  return await populateMeeting(
    Meeting.findById(meetingId),
  );
};