import { Schema, model } from "mongoose";
import { IMeeting } from "../types/meeting.types";

// =====================================================
// MEETING NOTE SCHEMA
// =====================================================

const meetingNoteSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },

    aiGeneratedSummary: {
      type: String,
      trim: true,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);

// =====================================================
// MEETING SCHEMA
// =====================================================

const meetingSchema = new Schema<IMeeting>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    description: {
      type: String,
      trim: true,
    },

    meetingLink: {
      type: String,
      trim: true,
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
      index: true,
    },

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
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// =====================================================
// MODEL
// =====================================================

const Meeting = model<IMeeting>("Meeting", meetingSchema);

export default Meeting;
