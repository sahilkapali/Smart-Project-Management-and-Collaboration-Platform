import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    // When a user logs in, they emit 'join' with their user ID
    socket.on("join", (userId: string) => {
      socket.join(userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn("Socket.io not initialized!");
  }
  return io;
};