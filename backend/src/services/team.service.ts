import Team from '../models/team.models';
import { ITeam } from '../types/team.types';

export const createTeam = async (name: string, description: string | undefined, ownerId: string): Promise<ITeam> => {
  const team = new Team({
    name,
    description,
    owner: ownerId,
    members: [ownerId] // Creator is added as the initial member
  });
  return await team.save();
};

export const getUserTeams = async (userId: string): Promise<ITeam[]> => {
  return await Team.find({ members: userId }).populate('owner', 'name email');
};