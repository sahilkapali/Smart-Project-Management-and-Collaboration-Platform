import { Request } from "express";

export interface AuthRequest extends Request {
  params: {
    id: string;
    [key: string]: string;
  };
}