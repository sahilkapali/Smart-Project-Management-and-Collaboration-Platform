import Project from '../models/project.models';
import { IProject } from '../types/project.types';

export const createProject = async (
  name: string, 
  description: string | undefined, 
  teamId: string, 
  ownerId: string
): Promise<IProject> => {
  const project = new Project({
    name,
    description,
    team: teamId,
    owner: ownerId
  });
  
  return await project.save();
};

export const getProjectsByTeam = async (teamId: string): Promise<IProject[]> => {
  return await Project.find({ team: teamId })
    .populate('team', 'name') // Fetches the team name
    .populate('owner', 'name email'); // Fetches the owner's details
};