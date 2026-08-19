import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load .env BEFORE reading GEMINI_API_KEY
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is missing. Please add a valid Gemini API key to your .env file.",
  );
}

// Gemini Developer API client
// Do NOT configure Vertex AI here.
export const gemini = new GoogleGenAI({
  apiKey,
});
