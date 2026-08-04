import mongoose, { Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  team: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
}