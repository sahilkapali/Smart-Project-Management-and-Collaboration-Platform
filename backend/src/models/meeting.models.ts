import { Schema, model, Document, Types } from 'mongoose';
import { Script } from 'node:vm';


// structure defining....
export interface IMeeting extends Document{
    meetingTitle: string;
    description?: string;
    project: Types.ObjectId;
    manager: Types.ObjectId;
    member: Types.ObjectId[];
    startTime: Date;
    endTime?: Date;
    meetingNotes?: string;
    aiSummary?: string;
    aiActionItems?: string[];
    createdAt: Date;
}


// schema defining.....

const MeetingSchema = new Schema<IMeeting>({
    meetingTitle:{
        type: String,
        required: [true, 'Meeting title is required'],
        trim: true
    },
    description:{
        type: String,
        trim: true
    },
    project:{
        type: Schema.Types.ObjectId,
        ref: 'Project',                                  // need to match name from project model aile lai project 
        required:[true, 'Meeting must belong to a project']
    },
    manager:{
        type: Schema.Types.ObjectId,
        ref:'User',                                   // need to match user model aile lai user
        required:[true, 'Meeting must have an menager']
    },
    member:[{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    startTime:{
        type: Date,
        required:[true, 'Start time is required']
    },
    endTime:{
        type: Date
    },
    meetingNotes:{
        type: String
    },
    aiSummary:{
        type: String
    },
    aiActionItems:[{
        type: String
    }],
    createdAt:{
        type: Date,
        default: Date.now
    }   
});


export const Meeting = model<IMeeting>('Meeting', MeetingSchema);