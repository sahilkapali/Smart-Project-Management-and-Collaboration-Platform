import mongoose, { Schema } from "mongoose";

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
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// =====================================================
// MEETING SCHEMA
// =====================================================

const meetingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: false,
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

    notes: {
      type: [meetingNoteSchema],
      default: [],
    },

    actionItems: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// =====================================================
// INDEX
// =====================================================

meetingSchema.index({
  projectId: 1,
  startTime: 1,
});

// =====================================================
// MODEL
// =====================================================

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
