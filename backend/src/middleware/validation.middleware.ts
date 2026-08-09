import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ERROR_CODES } from '../types/error.types';

export interface ValidationRule {
  field: string;
  location: 'body' | 'params' | 'query';
  required?: boolean;
  isObjectId?: boolean;
  isDate?: boolean;
  enum?: string[];
  minLength?: number;
}

export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: { field: string; message: string }[] = [];

    rules.forEach((rule) => {
      const target = req[rule.location];
      const value = target?.[rule.field];

      // 1. Required field validation
      if (
        rule.required &&
        (value === undefined || value === null || value === '')
      ) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required.`,
        });
        return;
      }

      // Skip optional empty values
      if (value === undefined || value === null || value === '') {
        return;
      }

      // 2. ObjectId validation
      if (rule.isObjectId) {
        if (
          typeof value !== 'string' ||
          !mongoose.Types.ObjectId.isValid(value)
        ) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be a valid ObjectId.`,
          });
        }
      }

      // 3. Enum validation
      if (rule.enum && !rule.enum.includes(String(value))) {
        errors.push({
          field: rule.field,
          message: `${rule.field} must be one of: ${rule.enum.join(', ')}.`,
        });
      }

      // 4. Date validation
      if (rule.isDate) {
        const isValidDate =
          typeof value === 'string' &&
          !isNaN(Date.parse(value));

        if (!isValidDate) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be a valid date format.`,
          });
        }
      }

      // 5. Minimum string length
      if (
        rule.minLength !== undefined &&
        typeof value === 'string' &&
        value.length < rule.minLength
      ) {
        errors.push({
          field: rule.field,
          message: `${rule.field} must be at least ${rule.minLength} characters long.`,
        });
      }
    });

    // Standardized response format for Task 7.3
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        status: 'fail',
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        data: null,
        errors,
      });
      return;
    }

    next();
  };
};