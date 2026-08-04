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
  meetingTitle: { 
    type: String, 
    required: true 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date
  },
  project: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  attendees: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
 
  notes: [meetingNoteSchema],
}, { 
  timestamps: true 
});

const Meeting = model<IMeeting>('Meeting', meetingSchema);

export default Meeting;