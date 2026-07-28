import mongoose, { Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
}