import { Document, Types } from 'mongoose';
export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
}


