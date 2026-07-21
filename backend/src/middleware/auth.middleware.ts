import { Request, Response, NextFunction } from 'express';

export const authenticateUser = (roles?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Your authentication logic here
    next();
  };
};