import { GoogleGenAI } from '@google/genai';


const ai = new GoogleGenAI({});

export const generateInsight = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to communicate with Gemini API');
  }
};