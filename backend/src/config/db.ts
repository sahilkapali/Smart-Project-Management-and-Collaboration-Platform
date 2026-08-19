import mongoose from "mongoose";

export const connectDatabase = async (uri: string): Promise<void> => {
  try {
    if (!uri) {
      throw new Error("DB_URI is not defined in environment variables.");
    }

    await mongoose.connect(uri);

    console.log("========================================");
    console.log(" MongoDB connected successfully");
    console.log("========================================");
  } catch (error) {
    console.error(" MongoDB connection failed:", error);

    process.exit(1);
  }
};
