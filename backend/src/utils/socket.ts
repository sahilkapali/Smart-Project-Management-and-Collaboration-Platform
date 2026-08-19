import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server | undefined;

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://smart-project-management-and-collab.vercel.app",
].filter(Boolean);

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (Postman, server-to-server, etc.)
        if (!origin) {
          return callback(null, true);
        }

        // Allow configured frontend origins
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.warn(`Socket.IO CORS blocked origin: ${origin}`);
        return callback(new Error("Not allowed by Socket.IO CORS"));
      },

      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

      credentials: true,
    },

    // Recommended for Render/proxy environments
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins their personal room
    socket.on("join", (userId: string) => {
      if (!userId) {
        console.warn("Socket join attempted without userId");
        return;
      }

      socket.join(userId);

      console.log(`User ${userId} joined socket room`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} - ${reason}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
