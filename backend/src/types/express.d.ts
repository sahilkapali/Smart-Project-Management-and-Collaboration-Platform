import { IProject } from './project.types';

declare global {
  namespace Express {
    interface Request {
      project?: IProject;
    }
  }
}

export {};