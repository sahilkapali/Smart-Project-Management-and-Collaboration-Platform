import { Schema, model } from 'mongoose';
import { IMeeting } from '../types/meeting.types';

const meetingNoteSchema = new Schema({
  content: { 
    type: String, 
    required: true 
  },
  aiGeneratedSummary: { 
    type: String 
  }
}, { 
  _id: true,
  timestamps: true 
});

const meetingSchema = new Schema<IMeeting>({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  meetingLink: { 
    type: String 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date
  },
  projectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  notes: [meetingNoteSchema],
}, { 
  timestamps: true 
});

const Meeting = model<IMeeting>('Meeting', meetingSchema);

export default Meeting;