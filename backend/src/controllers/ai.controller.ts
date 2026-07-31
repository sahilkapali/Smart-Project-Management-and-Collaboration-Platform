import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/gemini.service';

export const getProjectInsight = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'A prompt string is required in the request body.' 
      });
    }

    const aiResponseText = await aiService.generateInsight(prompt);

    return res.status(200).json({
      success: true,
      data: aiResponseText
    });
  } catch (error) {
    next(error); 
  }
};