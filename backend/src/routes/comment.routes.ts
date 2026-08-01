import { Router } from "express";
import {
  createComment,
  getComments,
  getCommentsByIssue,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller";


import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();


// Create Comment
router.post("/", authenticateUser(), createComment);

// Get All Comments
router.get("/", authenticateUser(), getComments);

// Get Comments of an Issue
router.get("/issue/:id", authenticateUser(), getCommentsByIssue);

// Update Comment
router.put("/:id", authenticateUser(), updateComment);

// Delete Comment
router.delete("/:id", authenticateUser(), deleteComment);

export default router;