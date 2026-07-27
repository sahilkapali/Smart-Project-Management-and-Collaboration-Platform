import { Request, Response, NextFunction } from 'express';
import Project from '../models/project.models';

export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, description } = req.body;

    const newProject = new Project({
      name,
      description,
      owner: userId,
      members: [userId]
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    next(err); 
  }
};

export const addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    if (project.owner.toString() !== req.user?.id) {
      res.status(403).json({ message: 'Only owners can add members' });
      return;
    }
    
    project.members.push(req.body.userId);
    await project.save();
    res.status(200).json({ message: 'Member added', project });
  } catch (err) {
    next(err);
  }
};