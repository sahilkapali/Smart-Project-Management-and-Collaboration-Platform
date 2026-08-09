import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// Initialize environment variables
dotenv.config();

// Database
import { connectDatabase } from "./config/db";

// Route Imports
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";

import projectRoutes from "./routes/project.routes";
import teamRoutes from "./routes/team.routes";
import taskRoutes from "./routes/task.routes";

import repositoryRoutes from "./routes/repository.routes";
import issueRoutes from "./routes/issue.routes";
import commentRoutes from "./routes/comment.routes";

import meetingRouter from "./routes/meeting.routes";
import aiRoutes from "./routes/ai.routes";
import notificationRoutes from "./routes/notification.routes";
import dashboardRoutes from "./routes/dashboard.routes";

import repositoryVersionRoutes from "./routes/repositoryVersion.routes";
import reportRoutes from "./routes/report.routes";
import activityRoutes from "./routes/activity.routes";

// Middleware
import errorHandler from "./middleware/errorHandler.middleware";

const app = express();

const PORT = process.env.PORT || 8080;
const DB_URI = process.env.DB_URI ?? process.env.MONGO_URI ?? "";

/**
 * Connect Database
 */
connectDatabase(DB_URI);

/**
 * Global Middlewares
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
 * Authentication
 */
app.use("/api/auth", authRouter);

/**
 * User
 */
app.use("/api/users", userRouter);

/**
 * Project & Team
 */
app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);

/**
 * Task
 */
app.use("/api/tasks", taskRoutes);

/**
 * Repository Module 
 */
app.use("/api/repositories", repositoryRoutes);
app.use("/api/repositories", repositoryVersionRoutes);

/**
 * Issue Module 
 */
app.use("/api/issues", issueRoutes);

/**
 * Comment Module 
 */
app.use("/api", commentRoutes);

// Report Module
app.use("/api/reports", reportRoutes);

// Activity Module
app.use("/api/activities", activityRoutes);

/**
 * Meeting
 */
app.use("/api/meetings", meetingRouter);

/**
 * AI
 */
app.use("/api/ai", aiRoutes);

/**
 * Notifications
 */
app.use("/api/notifications", notificationRoutes);

/**
 * Dashboard
 */
app.use("/api/dashboards", dashboardRoutes);

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