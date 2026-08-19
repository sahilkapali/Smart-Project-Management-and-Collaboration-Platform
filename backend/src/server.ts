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

import errorHandler from "./middleware/errorHandler.middleware";

const app = express();

// ===============================
// ENV CHECK
// ===============================

if (!ENV_CONFIG.mongodb_uri) {
  throw new Error("MongoDB URI missing");
}

if (!ENV_CONFIG.jwt_secret) {
  throw new Error("JWT secret missing");
}

const PORT = Number(process.env.PORT) || Number(ENV_CONFIG.port) || 5000;

// ===============================
// FRONTEND URLS
// ===============================

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://smart-project-management-and-collaboration-platform-qhr08g9th.vercel.app";

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  FRONTEND_URL,
];

console.log("Allowed Origins:");
console.log(allowedOrigins);

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

// ===============================
// CORS
// ===============================

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log("CORS Allowed:", origin);
      return callback(null, true);
    }

    console.log("CORS Blocked:", origin);
    return callback(null, false);
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

// APPLY CORS
app.use(cors(corsOptions));

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,

    message: "Smart Project Management Backend Running",
  });
});

// ===============================
// ROUTES
// ===============================

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

// ===============================
// ERROR HANDLER
// ===============================

app.use(errorHandler);

// ===============================
// SERVER
// ===============================

const server = http.createServer(app);

// Socket.io

initSocket(server);

// ===============================
// START
// ===============================

const startServer = async () => {
  try {
    await connectDatabase(ENV_CONFIG.mongodb_uri);

    server.listen(PORT, "0.0.0.0", () => {
      console.log("============================");
      console.log("🚀 Backend Running");
      console.log(`PORT: ${PORT}`);
      console.log(`FRONTEND: ${FRONTEND_URL}`);
      console.log("============================");
    });
  } catch (error) {
    console.error("Server startup failed:", error);

    process.exit(1);
  }
};

startServer();
