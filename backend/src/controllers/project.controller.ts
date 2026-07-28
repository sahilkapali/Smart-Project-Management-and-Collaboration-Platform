import { Response } from 'express';
import { AuthRequest } from '../types/custom';
import * as teamService from '../services/team.service';

export const handleCreateTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { name, description } = req.body;

    const errors: string[] = [];

    // 1. In-Controller Manual Validation
    
    // Validate 'name'
    if (!name || typeof name !== 'string') {
      errors.push('Team name is required and must be a string.');
    } else {
      const trimmedName = name.trim();
      if (trimmedName.length < 3) {
        errors.push('Team name must be at least 3 characters long.');
      } else if (trimmedName.length > 100) {
        errors.push('Team name cannot exceed 100 characters.');
      }
    }

    // Validate 'description' (Optional field)
    if (description !== undefined) {
      if (typeof description !== 'string') {
        errors.push('Description must be a string if provided.');
      } else if (description.trim().length === 0) {
        errors.push('Description cannot be empty or contain only spaces.');
      }
    }

    // Return 400 if any validation errors were collected
    if (errors.length > 0) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
      return;
    }

    // 2. Delegate to Service
    const finalDescription = description ? description.trim() : undefined;
    const team = await teamService.createTeam(name.trim(), finalDescription, userId);
    
    res.status(201).json(team);
  } catch (error: any) {
    // Handle unexpected server issues
    res.status(500).json({ error: error.message || 'An unexpected error occurred while creating the team.' });
  }
};

export const handleGetTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    
    // Safety check for user ID existence
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access. User ID is missing.' });
      return;
    }

    const teams = await teamService.getUserTeams(userId);
    res.status(200).json(teams);
  } catch (error: any) {
    // Handle unexpected server issues
    res.status(500).json({ error: error.message || 'An unexpected error occurred while fetching teams.' });
  }
};