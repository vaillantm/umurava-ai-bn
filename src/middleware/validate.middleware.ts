import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;        // Replace body with validated & typed data
      next();
    } catch (error: any) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors || error.message
      });
    }
  };
};