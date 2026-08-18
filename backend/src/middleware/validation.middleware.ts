import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { ERROR_CODES } from "../types/error.types";

// ============================================================
// VALIDATION RULE
// ============================================================

export interface ValidationRule {
  field: string;
  location: "body" | "params" | "query";

  required?: boolean;

  isObjectId?: boolean;

  isDate?: boolean;

  enum?: string[];

  minLength?: number;
}

// ============================================================
// VALIDATE MIDDLEWARE
// ============================================================

export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: {
      field: string;
      message: string;
    }[] = [];

    // ========================================================
    // PROCESS RULES
    // ========================================================

    rules.forEach((rule) => {
      const target = req[rule.location];

      const value = target?.[rule.field];

      // ======================================================
      // REQUIRED VALIDATION
      // ======================================================

      if (
        rule.required &&
        (value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === ""))
      ) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required.`,
        });

        return;
      }

      // ======================================================
      // OPTIONAL EMPTY VALUES
      // ======================================================

      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return;
      }

      // ======================================================
      // OBJECT ID VALIDATION
      // ======================================================

      if (rule.isObjectId) {
        const isValidObjectId =
          typeof value === "string" &&
          mongoose.Types.ObjectId.isValid(value.trim());

        if (!isValidObjectId) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be a valid ObjectId.`,
          });

          return;
        }

        // Normalize ObjectId string
        if (typeof value === "string") {
          target[rule.field] = value.trim();
        }
      }

      // ======================================================
      // ENUM VALIDATION
      // ======================================================

      if (rule.enum) {
        if (typeof value !== "string") {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be a valid value.`,
          });

          return;
        }

        const normalizedValue = value.trim().toLowerCase();

        const matchedEnum = rule.enum.find(
          (item) => item.toLowerCase() === normalizedValue,
        );

        if (!matchedEnum) {
          errors.push({
            field: rule.field,
            message:
              `${rule.field} must be one of: ` + `${rule.enum.join(", ")}.`,
          });

          return;
        }

        // Normalize enum value
        target[rule.field] = matchedEnum;
      }

      // ======================================================
      // DATE VALIDATION
      // ======================================================

      if (rule.isDate) {
        const isValidDate =
          typeof value === "string" && !Number.isNaN(Date.parse(value));

        if (!isValidDate) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be a valid date format.`,
          });
        }
      }

      // ======================================================
      // MINIMUM LENGTH
      // ======================================================

      if (rule.minLength !== undefined) {
        if (typeof value !== "string") {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be a string.`,
          });

          return;
        }

        const trimmedValue = value.trim();

        if (trimmedValue.length < rule.minLength) {
          errors.push({
            field: rule.field,
            message:
              `${rule.field} must be at least ` +
              `${rule.minLength} characters long.`,
          });
        }
      }
    });

    // ========================================================
    // VALIDATION FAILED
    // ========================================================

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        status: "fail",
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Validation failed",
        data: null,
        errors,
      });

      return;
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    next();
  };
};
