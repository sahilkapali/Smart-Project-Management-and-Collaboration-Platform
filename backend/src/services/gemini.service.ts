import { ai } from '../config/gemini';

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

export const suggestTaskPriority = async (title: string, description: string): Promise<string> => {
  try {
    const prompt = `
      You are an expert Agile Scrum Master. Evaluate the following task and determine its priority.
      Task Title: "${title}"
      Task Description: "${description || 'No description provided.'}"
      
      Respond with EXACTLY ONE of these four words: low, medium, high, critical.
      Do not include punctuation, explanations, or any other text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let priority = response.text ? response.text.trim().toLowerCase() : 'medium';

   
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      priority = 'medium'; 
    }

    return priority;
  } catch (error) {
    console.error("Gemini Prioritization Error:", error);
    throw new Error("Failed to analyze task priority.");
  }
};


export const generateMeetingSummary = async (notes: string): Promise<string> => {
  try {
    const prompt = `
      You are an expert executive assistant. Please read the following raw meeting notes and provide a concise, well-structured summary. 
      Focus on the main topics discussed, key decisions made, and overall outcomes.
      Do not include action items (those will be extracted separately).
      
      Meeting Notes:
      """
      ${notes}
      """
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No summary could be generated.";
  } catch (error) {
    console.error("Gemini Meeting Summary Error:", error);
    throw new Error("Failed to generate meeting summary.");
  }
};


export const extractActionItems = async (notes: string): Promise<string[]> => {
  try {
    const prompt = `
      You are an expert project manager. Analyze the following meeting notes and extract a list of specific action items, tasks, or follow-ups.
      Return ONLY a valid JSON array of strings. Do not include markdown formatting, explanations, or labels.
      If no action items are found, return an empty array: []
      
      Notes:
      """
      ${notes}
      """
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text ? response.text.trim() : "[]";
    
    
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    
    const actionItems: string[] = JSON.parse(text);
    return actionItems;
    
  } catch (error) {
    console.error("Gemini Action Item Extraction Error:", error);
    
    return [];
  }
};

