// global.types.ts
import { ROLE } from "./enum.types";

export interface IJwtPayload {
  id: string;
  email: string;
  role: ROLE;
}

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

export {};