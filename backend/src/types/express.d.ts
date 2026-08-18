import { ROLE } from "./enum.types";

import type Project from "../models/project.models";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: ROLE;
    }

    interface Request {
      project?: InstanceType<typeof Project>;
    }
  }
}

export {};
