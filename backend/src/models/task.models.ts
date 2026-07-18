import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  project: mongoose.Types.ObjectId;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  comments: { user: mongoose.Types.ObjectId; text: string; createdAt: Date }[];
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Review', 'Done'], 
    default: 'To Do' 
  },
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<ITask>('Task', TaskSchema);