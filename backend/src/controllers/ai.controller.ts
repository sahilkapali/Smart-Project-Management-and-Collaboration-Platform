import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");


export const generateInsight = async (prompt: string): Promise<string> => {
  try {
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    
    const result = await model.generateContent(prompt);
    
    
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI insight. Please check your API key and try again.");
  }
};