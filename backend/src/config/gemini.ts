import { GoogleGenAI } from '@google/genai';
import { ENV_CONFIG } from './env';


export const ai = new GoogleGenAI({
  apiKey: ENV_CONFIG.gemini_api_key
});

