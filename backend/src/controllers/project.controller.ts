import { Response } from 'express';
import { AuthRequest } from '../types/custom';
import * as projectService from '../services/project.service';

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    
    const { name, description, teamId } = req.body;

    const errors: string[] = [];

   
    if (!name || typeof name !== 'string') {
      errors.push('Project name is required and must be a string.');
    } else {
      const trimmedName = name.trim();
      if (trimmedName.length < 3) {
        errors.push('Project name must be at least 3 characters long.');
      } else if (trimmedName.length > 100) {
        errors.push('Project name cannot exceed 100 characters.');
      }
    }

   
    if (description !== undefined && description !== null && typeof description !== 'string') {
      errors.push('Description must be a string if provided.');
    }

    
    if (!teamId || typeof teamId !== 'string') {
      errors.push('teamId is required to create a project.');
    }

    if (errors.length > 0) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
      return;
    }

    
    const finalDescription = description ? description.trim() : undefined;
    const project = await projectService.createProject(
      name.trim(),
      finalDescription,
      teamId,
      userId
    );
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An unexpected error occurred while creating the project.' });
  }
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
   
    const teamId = req.query.teamId as string;
    
    if (!teamId) {
      res.status(400).json({ message: 'Team ID is required. Pass it as a query parameter: ?teamId=...' });
      return;
    }

    
    const projects = await projectService.getProjectsByTeam(teamId);
    
    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An unexpected error occurred while fetching projects.' });
  }
};