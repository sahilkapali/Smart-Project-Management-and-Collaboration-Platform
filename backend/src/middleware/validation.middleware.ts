import { Request, Response, NextFunction } from "express";

type ValidationRule = {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "object";
  minLength?: number;
  maxLength?: number;
};

export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: {
      field: string;
      message: string;
    }[] = [];

    const body = req.body || {};

    for (const rule of rules) {
      const value = body[rule.field];

      // Required validation
      if (
        rule.required &&
        (value === undefined ||
          value === null ||
          value === "")
      ) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required`,
        });

        continue;
      }

      // Skip optional fields that aren't provided
      if (value === undefined || value === null || value === "") {
        continue;
      }

      // Type validation
      if (rule.type) {
        let validType = true;

        switch (rule.type) {
          case "string":
            validType = typeof value === "string";
            break;

          case "number":
            validType =
              typeof value === "number" &&
              !Number.isNaN(value);
            break;

          case "boolean":
            validType = typeof value === "boolean";
            break;

          case "object":
            validType =
              typeof value === "object" &&
              value !== null &&
              !Array.isArray(value);
            break;
        }

        if (!validType) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be a ${rule.type}`,
          });

          continue;
        }
      }

      // String length validation
      if (
        typeof value === "string" &&
        rule.minLength !== undefined &&
        value.length < rule.minLength
      ) {
        errors.push({
          field: rule.field,
          message: `${rule.field} must be at least ${rule.minLength} characters`,
        });
      }

      if (
        typeof value === "string" &&
        rule.maxLength !== undefined &&
        value.length > rule.maxLength
      ) {
        errors.push({
          field: rule.field,
          message: `${rule.field} must not exceed ${rule.maxLength} characters`,
        });
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });

      return;
    }

    next();
  };
};