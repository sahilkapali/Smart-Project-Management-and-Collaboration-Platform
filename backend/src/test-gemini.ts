import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const gemini = new GoogleGenAI({
  apiKey,
});

const test = async () => {
  try {
    console.log("Testing Gemini API...");

    const response = await gemini.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents:
        "Reply with exactly this sentence: Gemini connection is working.",
    });

    console.log("Gemini response:");
    console.log(response.text);
  } catch (error) {
    console.error("Gemini API test failed:");
    console.error(error);
  }
};

test();