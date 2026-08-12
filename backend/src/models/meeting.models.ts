import { Schema, model } from "mongoose";
import { IMeeting } from "../types/meeting.types";

const meetingNoteSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },

    aiGeneratedSummary: {
      type: String,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const meetingSchema = new Schema<IMeeting>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    meetingLink: {
      type: String,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // User who created the meeting
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    notes: [meetingNoteSchema],

    actionItems: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Meeting = model<IMeeting>("Meeting", meetingSchema);

export default Meeting;