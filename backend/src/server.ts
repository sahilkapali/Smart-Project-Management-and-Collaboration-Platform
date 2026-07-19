import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectDatabase } from "./config/db";

import authRouter from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import repositoryRoutes from "./routes/repository.routes";
import issueRoutes from "./routes/issue.routes";
import commentRoutes from "./routes/comment.routes";

import { errorHandler } from "./middleware/errorHandler.middleware";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;
const DB_URI = process.env.DB_URI ?? "";

/**
 * Connect Database
 */
connectDatabase(DB_URI);

/**
 * Middlewares
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/**
 * Home Route
 */
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Smart Project Management Backend Running",
  });
});

/**
 * Authentication Routes
 */
app.use("/api/auth", authRouter);

/**
 * Project Routes
 */
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api", commentRoutes);

/**
 * Error Handler (Always Last)
 */
app.use(errorHandler);

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});