import Meeting from "../models/meeting.models";
import { createNotification } from "./notification.service";
import { NotificationType } from "../types/notification.types";

export const createMeeting = async (
  meetingData: Record<string, any>
) => {
  // Create the meeting
  const meeting = new Meeting(meetingData);

  const savedMeeting = await meeting.save();

  // Notify all participants
  const participants = meetingData.participants || [];

  for (const participantId of participants) {
    // Don't notify the creator if they are also a participant
    if (
      meetingData.createdBy &&
      participantId.toString() === meetingData.createdBy.toString()
    ) {
      continue;
    }

    await createNotification(
      participantId.toString(),

      `You have been invited to the meeting "${savedMeeting.title}".`,

      NotificationType.MEETING_INVITATION,

      meetingData.createdBy?.toString(),

      savedMeeting._id.toString()
    );
  }

  return await Meeting.findById(savedMeeting._id)
    .populate("createdBy", "name email")
    .populate("participants", "name email");
};

export const getMeetingsByProject = async (
  projectId: string
) => {
  return await Meeting.find({ projectId })
    .populate("createdBy", "name email")
    .populate("participants", "name email")
    .sort({ startTime: 1 });
};

export const getMeetingById = async (
  id: string
) => {
  return await Meeting.findById(id)
    .populate("createdBy", "name email")
    .populate("participants", "name email");
};

export const updateMeeting = async (
  id: string,
  updateData: Record<string, any>
) => {
  return await Meeting.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
    }
  )
    .populate("createdBy", "name email")
    .populate("participants", "name email");
};

export const deleteMeeting = async (
  id: string
) => {
  return await Meeting.findByIdAndDelete(id);
};