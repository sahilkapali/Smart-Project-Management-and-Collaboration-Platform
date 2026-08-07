import { Response } from "express";
import { AuthRequest } from "../types/custom";

import {
  createCommentService,
  getCommentsService,
  getCommentsByIssueService,
  updateCommentService,
  deleteCommentService,
} from "../services/comment.service";


export const createComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { issue, comment } = req.body;

    // Validation
    if (!issue || !comment) {
      res.status(400).json({
        success: false,
        message: "Issue and Comment are required.",
      });
      return;
    }

    const newComment = await createCommentService({
      issue,
      comment,
      user: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: newComment,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const getComments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const comments = await getCommentsService();

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const getCommentsByIssue = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    
    const comments = await getCommentsByIssueService(req.params.id as string);

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const updateComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { comment } = req.body;

    // Validation
    if (!comment) {
      res.status(400).json({
        success: false,
        message: "Comment cannot be empty.",
      });
      return;
    }

    
    const updatedComment = await updateCommentService(
      req.params.id as string,
      { comment }
    );

    if (!updatedComment) {
      res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      data: updatedComment,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const deleteComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    
    const deletedComment = await deleteCommentService(req.params.id as string);

    if (!deletedComment) {
      res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};