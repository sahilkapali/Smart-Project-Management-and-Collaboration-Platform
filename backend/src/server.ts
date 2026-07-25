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
import userRouter from "./routes/user.routes"; // <-- Added

import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import meetingRouter from "./routes/meeting.routes";
import aiRoutes from "./routes/ai.routes";
import notificationRoutes from "./routes/notification.routes";
import dashboardRoutes from "./routes/dashboard.routes";

// Middleware Imports
import { errorHandler } from "./middleware/errorHandler.middleware";

const PORT = process.env.PORT || 8080;
const DB_URI = process.env.DB_URI ?? process.env.MONGO_URI ?? "";

const app = express();

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
 * API Routes
 */

// Authentication Routes
app.use("/api/auth", authRouter);

// User Routes <-- Added
app.use("/api/users", userRouter);

// Project Routes
app.use("/api/projects", projectRoutes);

// Task Routes
app.use("/api/tasks", taskRoutes);

// Meeting Routes
app.use("/api/meetings", meetingRouter);

// AI Routes
app.use("/api/ai", aiRoutes);

// Notification Routes
app.use("/api/notifications", notificationRoutes);

// Dashboard Routes
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