import { Response } from "express";
import { AuthRequest } from "../types/custom";

import {
  getProjectReportService,
  getTaskReportService,
  getIssueReportService,
} from "../services/report.service";

// Get Complete Project Report
export const getProjectReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const projectId = String(req.params.projectId);

    // Validation
    if (!projectId || projectId === "undefined") {
      res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
      return;
    }

    const report = await getProjectReportService(
      projectId
    );

    res.status(200).json({
      success: true,
      message: "Project report generated successfully.",
      data: report,
    });
  } catch (err: any) {
    const statusCode =
      err.message === "Project not found." ||
      err.message === "Invalid project ID."
        ? 404
        : 500;

    res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  }
};


// Get Task Report
export const getTaskReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const projectId = String(req.params.projectId);

    if (!projectId || projectId === "undefined") {
      res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
      return;
    }

    const report = await getTaskReportService(
      projectId
    );

    res.status(200).json({
      success: true,
      message: "Task report generated successfully.",
      data: report,
    });
  } catch (err: any) {
    const statusCode =
      err.message === "Project not found." ||
      err.message === "Invalid project ID."
        ? 404
        : 500;

    res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  }
};


// Get Issue Report
export const getIssueReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const projectId = String(req.params.projectId);

    if (!projectId || projectId === "undefined") {
      res.status(400).json({
        success: false,
        message: "Project ID is required.",
      });
      return;
    }

    const report = await getIssueReportService(
      projectId
    );

    res.status(200).json({
      success: true,
      message: "Issue report generated successfully.",
      data: report,
    });
  } catch (err: any) {
    const statusCode =
      err.message === "Project not found." ||
      err.message === "Invalid project ID."
        ? 404
        : 500;

    res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  }
};