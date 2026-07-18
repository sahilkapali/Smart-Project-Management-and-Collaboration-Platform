import { Response } from 'express';
import Project from '../models/project.models';
import { AuthRequest } from '../types/custom';

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addMember = async (req: AuthRequest, res: Response): Promise<void> => {
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};