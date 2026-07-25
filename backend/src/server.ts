import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import projectRoutes from './routes/project.routes';
import teamRoutes from './routes/team.routes';
import taskRoutes from './routes/task.routes';

import { connectDatabase } from "./config/db";

import authRouter from "./routes/auth.routes";

import { errorHandler } from "./middleware/errorHandler.middleware";

const PORT = process.env.PORT || 8080;
const DB_URI = process.env.DB_URI ?? "";

dotenv.config();
const app = express();

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
 * Connect Database
 */
connectDatabase(DB_URI);

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

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
app.use("/api/auth", authRouter);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);

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