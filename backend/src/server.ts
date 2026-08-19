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

// Error middleware
import errorHandler from "./middleware/errorHandler.middleware";

const app = express();

// =====================================================
// ENVIRONMENT CHECK
// =====================================================

if (!ENV_CONFIG.mongodb_uri) {
  throw new Error("MongoDB URI is missing.");
}

if (!ENV_CONFIG.jwt_secret) {
  throw new Error("JWT secret is missing.");
}

// Render automatically provides PORT
const PORT = Number(process.env.PORT) || Number(ENV_CONFIG.port) || 5000;

// =====================================================
// FRONTEND URL CONFIGURATION
// =====================================================

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://smart-project-management-and-collab.vercel.app";

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  "http://localhost:3000",
  "http://127.0.0.1:3000",

  FRONTEND_URL,
];

console.log("Allowed Origins:");
console.log(allowedOrigins);

// =====================================================
// DATABASE
// =====================================================

connectDatabase(ENV_CONFIG.mongodb_uri);

// =====================================================
// GLOBAL MIDDLEWARE
// =====================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman / server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS Origin:", origin);

      return callback(new Error("CORS blocked this origin"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,

    message: "Smart Project Management Backend Running",
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRouter);

app.use("/api/users", userRouter);

app.use("/api/projects", projectRoutes);

app.use("/api/teams", teamRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/repositories", repositoryRoutes);

app.use("/api/repositories", repositoryVersionRoutes);

app.use("/api/repository-files", repositoryFileRoutes);

app.use("/api/issues", issueRoutes);

app.use("/api", commentRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/activities", activityRoutes);

app.use("/api/meetings", meetingRouter);

app.use("/api/ai", aiRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/dashboard", dashboardRoutes);

// =====================================================
// ERROR HANDLER
// MUST BE LAST
// =====================================================

app.use(errorHandler);

// =====================================================
// HTTP SERVER
// =====================================================

const server = http.createServer(app);

// =====================================================
// SOCKET.IO
// =====================================================

initSocket(server);

// =====================================================
// START SERVER
// =====================================================

server.listen(PORT, "0.0.0.0", () => {
  console.log("================================");

  console.log("🚀 Backend Started Successfully");

  console.log(`PORT: ${PORT}`);

  console.log(`Frontend: ${FRONTEND_URL}`);

  console.log("================================");
});
