import { Response } from 'express';
import Task from '../models/task.models';
import { AuthRequest } from '../types/custom';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateKanbanStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );
    res.status(200).json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addTaskComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    task.comments.push({ 
      user: req.user?.id as any, 
      text: req.body.text, 
      createdAt: new Date() 
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};