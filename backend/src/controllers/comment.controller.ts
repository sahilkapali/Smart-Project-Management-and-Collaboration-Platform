import { Response } from "express";
import Comment from "../models/comment.models";
import { AuthRequest } from "../types/custom";

// Add Comment
export const addComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const comment = new Comment({
      issue: req.params.id,
      user: req.user?.id,
      comment: req.body.comment,
    });

    const savedComment = await comment.save();

    res.status(201).json(savedComment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get Comments for an Issue
export const getComments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const comments = await Comment.find({
      issue: req.params.id,
    })
      .populate("user")
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Comment
export const deleteComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      res.status(404).json({
        message: "Comment not found",
      });
      return;
    }

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};