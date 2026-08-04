import { Request } from "express";
import { IJwtPayload } from "./global.types";

export interface AuthRequest extends Request {
  user?: IJwtPayload;
}