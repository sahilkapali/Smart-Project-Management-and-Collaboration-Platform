import { Request, Response, NextFunction } from 'express';


export const validate = (validationFn: (data: any) => string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      
      const errors = validationFn(req.body);

      
      if (errors && errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: errors.join(', '),
          errors: errors
        });
      }

      
      next();
    } catch (error) {
      next(error);
    }
  };
};