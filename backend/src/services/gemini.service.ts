import { ai } from '../config/gemini'; 

/**
 * Takes a raw meeting transcript and uses Gemini to generate a structured markdown summary.
 */
export const generateMeetingSummary = async (transcript: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are an expert project management AI assistant.
        Analyze the following raw meeting transcript and generate a beautifully formatted markdown summary.
        
        Please format the response with the following exact headers:
        ### 📌 Meeting Overview
        ### 🔑 Key Discussion Points
        ### 🚀 Action Items (Assign names if mentioned)
        ### 📅 Next Steps
        
        Raw Transcript:
        "${transcript}"
      `,
    });

    return response.text || 'Could not generate a summary from the provided transcript.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate AI summary.');
  }
};