import dotenv from "dotenv";

dotenv.config();

export const ENV_CONFIG = {
  port: Number(process.env.PORT) || 8080,

  mongodb_uri: process.env.MONGODB_URI || "",

  jwt_secret: process.env.JWT_SECRET || "",

  jwt_expires_in: process.env.JWT_EXPIRES_IN || "7d",

  node_env: process.env.NODE_ENV || "development",
};