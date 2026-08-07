import mongoose, { Schema } from 'mongoose';
import { ITeam } from '../types/team.types';

const TeamSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model<ITeam>('Team', TeamSchema);