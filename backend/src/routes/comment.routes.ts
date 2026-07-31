import { Router } from "express";

import {
  createComment,
  getComments,
  getCommentsByIssue,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller";

import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

// Create Comment
router.post("/", verifyToken, createComment);

// Get All Comments
router.get("/", verifyToken, getComments);

// Get Comments of an Issue
router.get("/issue/:id", verifyToken, getCommentsByIssue);

// Update Comment
router.put("/:id", verifyToken, updateComment);

// Delete Comment
router.delete("/:id", verifyToken, deleteComment);

export default router;