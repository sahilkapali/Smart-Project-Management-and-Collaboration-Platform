import mongoose, { Schema } from 'mongoose';
import { IProject } from '../types/project.types';

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);