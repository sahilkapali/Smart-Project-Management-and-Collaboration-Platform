import Meeting from "../models/meeting.models";
import { createNotification } from "./notification.service";
import {
  NotificationType,
  NotificationEntityType,
} from "../types/notification.types";

/**
 * Create a meeting
 */
export const createMeeting = async (
  meetingData: Record<string, any>,
) => {
  const meeting = new Meeting(meetingData);

  const savedMeeting = await meeting.save();

  const participants = meetingData.participants || [];

  for (const participantId of participants) {
    // Don't notify the creator
    if (
      meetingData.createdBy &&
      participantId.toString() ===
        meetingData.createdBy.toString()
    ) {
      continue;
    }

    await createNotification(
      participantId.toString(),
      `You have been invited to the meeting "${savedMeeting.title}".`,
      NotificationType.MEETING_INVITATION,
      meetingData.createdBy?.toString(),
      savedMeeting._id.toString(),
      NotificationEntityType.MEETING,
    );
  }

  return await Meeting.findById(savedMeeting._id)
    .populate(
      "createdBy",
      "firstName lastName email role",
    )
    .populate(
      "participants",
      "firstName lastName email role",
    );
};

/**
 * Get meetings by project
 */
export const getMeetingsByProject = async (
  projectId: string,
) => {
  return await Meeting.find({ projectId })
    .populate(
      "createdBy",
      "firstName lastName email role",
    )
    .populate(
      "participants",
      "firstName lastName email role",
    )
    .sort({ startTime: 1 });
};

/**
 * Get meeting by ID
 */
export const getMeetingById = async (
  id: string,
) => {
  return await Meeting.findById(id)
    .populate(
      "createdBy",
      "firstName lastName email role",
    )
    .populate(
      "participants",
      "firstName lastName email role",
    );
};

/**
 * Update meeting
 */
export const updateMeeting = async (
  id: string,
  updateData: Record<string, any>,
) => {
  return await Meeting.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  )
    .populate(
      "createdBy",
      "firstName lastName email role",
    )
    .populate(
      "participants",
      "firstName lastName email role",
    );
};

/**
 * Delete meeting
 */
export const deleteMeeting = async (
  id: string,
) => {
  return await Meeting.findByIdAndDelete(id);
};

/* =====================================================
   MEETING NOTES
   ===================================================== */

/**
 * Add a new meeting note
 *
 * POST /api/meetings/:id/notes
 */
export const addMeetingNotes = async (
  meetingId: string,
  content: string,
) => {
  const meeting =
    await Meeting.findById(meetingId);

  if (!meeting) {
    return null;
  }

  /*
   * The notes field is optional in the model,
   * so initialize it if it doesn't exist.
   */
  if (!meeting.notes) {
    meeting.notes = [];
  }

  meeting.notes.push({
    content,
  } as any);

  await meeting.save();

  return await Meeting.findById(meetingId)
    .populate(
      "createdBy",
      "firstName lastName email role",
    )
    .populate(
      "participants",
      "firstName lastName email role",
    );
};

/**
 * Update an existing meeting note
 *
 * PUT /api/meetings/:id/notes
 */
export const updateMeetingNotes = async (
  meetingId: string,
  noteId: string,
  content: string,
) => {
  const meeting =
    await Meeting.findById(meetingId);

  if (!meeting) {
    return null;
  }

  /*
   * If the meeting doesn't contain notes,
   * there is nothing to update.
   */
  if (!meeting.notes) {
    return undefined;
  }

  const note = meeting.notes.find(
    (item: any) =>
      item._id?.toString() === noteId,
  );

  if (!note) {
    return undefined;
  }

  note.content = content;

  await meeting.save();

  return await Meeting.findById(meetingId)
    .populate(
      "createdBy",
      "firstName lastName email role",
    )
    .populate(
      "participants",
      "firstName lastName email role",
    );
};

/**
 * Partially update an existing meeting note
 *
 * PATCH /api/meetings/:id/notes
 */
export const patchMeetingNotes = async (
  meetingId: string,
  noteId: string,
  content?: string,
) => {
  const meeting =
    await Meeting.findById(meetingId);

  if (!meeting) {
    return null;
  }

  /*
   * If the meeting doesn't contain notes,
   * there is nothing to patch.
   */
  if (!meeting.notes) {
    return undefined;
  }

  const note = meeting.notes.find(
    (item: any) =>
      item._id?.toString() === noteId,
  );

  if (!note) {
    return undefined;
  }

  if (content !== undefined) {
    note.content = content;
  }

  await meeting.save();

  return await Meeting.findById(meetingId)
    .populate(
      "createdBy",
      "firstName lastName email role",
    )
    .populate(
      "participants",
      "firstName lastName email role",
    );
};