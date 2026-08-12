import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

import { ENV_CONFIG } from "./config/env";
import { connectDatabase } from "./config/db";

// Routes
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";

import projectRoutes from "./routes/project.routes";
import teamRoutes from "./routes/team.routes";
import taskRoutes from "./routes/task.routes";
import repositoryRoutes from "./routes/repository.routes";
import repositoryVersionRoutes from "./routes/repositoryVersion.routes";

import issueRoutes from "./routes/issue.routes";
import commentRoutes from "./routes/comment.routes";

import meetingRouter from "./routes/meeting.routes";
import aiRoutes from "./routes/ai.routes";
import notificationRoutes from "./routes/notification.routes";

import dashboardRoutes from "./routes/dashboard.routes";
import reportRoutes from "./routes/report.routes";
import activityRoutes from "./routes/activity.routes";

// Middleware
import { errorHandler } from "./middleware/errorHandler.middleware";

const app = express();

//Environment Configuration Validation

if (!ENV_CONFIG.mongodb_uri) {
  throw new Error("DB_URI is not configured in the .env file.");
}

if (!ENV_CONFIG.jwt_secret) {
  throw new Error("JWT_SECRET is not configured in the .env file.");
}

const PORT = ENV_CONFIG.port;

//Database Connection

connectDatabase(ENV_CONFIG.mongodb_uri);

//Global middlewares

// Parse JSON requests
app.use(express.json());

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// CORS Configuration

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);


 //Home / Health Check

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Smart Project Management Backend Running",
  });
});

//Authentication Route
app.use("/api/auth", authRouter);

//User Routes
app.use("/api/users", userRouter);

//Project & Team Routes
app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);

//Task Routes
app.use("/api/tasks", taskRoutes);

//Repository Routes
app.use("/api/repositories", repositoryRoutes);
app.use("/api/repositories", repositoryVersionRoutes);

//Issue Routes
app.use("/api/issues", issueRoutes);

//Comment Routes
app.use("/api", commentRoutes);

//Report Routes
app.use("/api/reports", reportRoutes);

//Activity Routes
app.use("/api/activities", activityRoutes);

//Meeting Routes
app.use("/api/meetings", meetingRouter);

//AI Routes
app.use("/api/ai", aiRoutes);

//Notification Routes
app.use("/api/notifications", notificationRoutes);

// Dashboard Routes
app.use("/api/dashboards", dashboardRoutes);

// Global Error Handler ,MUST BE LAST
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
