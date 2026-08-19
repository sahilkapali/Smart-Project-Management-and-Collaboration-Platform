import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./utils/socket";

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
import repositoryFileRoutes from "./routes/repositoryFile.routes";
import issueRoutes from "./routes/issue.routes";
import commentRoutes from "./routes/comment.routes";
import meetingRouter from "./routes/meeting.routes";
import aiRoutes from "./routes/ai.routes";
import notificationRoutes from "./routes/notification.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import reportRoutes from "./routes/report.routes";
import activityRoutes from "./routes/activity.routes";

// Middleware
import errorHandler from "./middleware/errorHandler.middleware";

const app = express();

// =====================================================
// ENVIRONMENT CONFIGURATION
// =====================================================

if (!ENV_CONFIG.mongodb_uri) {
  throw new Error("DB_URI is not configured in the .env file.");
}

if (!ENV_CONFIG.jwt_secret) {
  throw new Error("JWT_SECRET is not configured in the .env file.");
}

const PORT = ENV_CONFIG.port || process.env.PORT || 5000;

// =====================================================
// DATABASE CONNECTION
// =====================================================

connectDatabase(ENV_CONFIG.mongodb_uri);

// =====================================================
// GLOBAL MIDDLEWARES
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =====================================================
// CORS CONFIGURATION
// =====================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// =====================================================
// HOME / HEALTH CHECK
// =====================================================

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Smart Project Management Backend Running",
  });
});

// =====================================================
// AUTHENTICATION ROUTES
// =====================================================

app.use("/api/auth", authRouter);

// =====================================================
// USER ROUTES
// =====================================================

app.use("/api/users", userRouter);

// =====================================================
// PROJECT & TEAM ROUTES
// =====================================================

app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);

// =====================================================
// TASK ROUTES
// =====================================================

app.use("/api/tasks", taskRoutes);

// =====================================================
// REPOSITORY ROUTES
// =====================================================

app.use("/api/repositories", repositoryRoutes);
app.use("/api/repositories", repositoryVersionRoutes);
app.use("/api/repository-files", repositoryFileRoutes);

// =====================================================
// ISSUE ROUTES
// =====================================================

app.use("/api/issues", issueRoutes);

// =====================================================
// COMMENT ROUTES
// =====================================================

app.use("/api", commentRoutes);

// =====================================================
// REPORT ROUTES
// =====================================================

app.use("/api/reports", reportRoutes);

// =====================================================
// ACTIVITY ROUTES
// =====================================================

app.use("/api/activities", activityRoutes);

// =====================================================
// MEETING ROUTES
// =====================================================

app.use("/api/meetings", meetingRouter);

// =====================================================
// AI ROUTES
// =====================================================

app.use("/api/ai", aiRoutes);

// =====================================================
// NOTIFICATION ROUTES
// =====================================================

app.use("/api/notifications", notificationRoutes);

// =====================================================
// DASHBOARD ROUTES
// =====================================================

app.use("/api/dashboard", dashboardRoutes);

// =====================================================
// GLOBAL ERROR HANDLER
// MUST BE LAST
// =====================================================

app.use(errorHandler);

// =====================================================
// START SERVER WITH SOCKET.IO
// =====================================================

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
