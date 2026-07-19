import { Router } from "express";
import {
  addComment,
  getComments,
  deleteComment,
} from "../controllers/comment.controller";

import { verifyToken } from "../utils/generateToken.utils";

const router = Router();

// Add Comment to an Issue
router.post("/issues/:id/comments", verifyToken, addComment);

// Get Comments for an Issue
router.get("/issues/:id/comments", verifyToken, getComments);

// Delete Comment
router.delete("/comments/:id", verifyToken, deleteComment);

export default router;