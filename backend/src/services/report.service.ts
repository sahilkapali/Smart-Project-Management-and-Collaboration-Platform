import Project from '../models/project.models';
import Task from '../models/task.models';
import Repository from '../models/repository.models';
import Issue from '../models/issue.models';

export const getProjectReportService = async (projectId: string) => {
  const project = await Project.findById(projectId)
    .populate('createdBy', 'name email')
    .populate('members', 'name email');

  if (!project) {
    throw new Error('Project not found');
  }

  const tasks = await Task.find({ project: projectId });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    todo: tasks.filter((t) => (t.status as string) === 'Todo' || (t.status as string) === 'Pending').length,
  };

  const repositories = await Repository.find({ project: projectId });
  const repositoryIds = repositories.map((repo) => repo._id);

  const issues = await Issue.find({ repository: { $in: repositoryIds } });

  const issueStats = {
    total: issues.length,
    open: issues.filter((i) => i.status === 'Open').length,
    inProgress: issues.filter((i) => i.status === 'In Progress').length,
    resolved: issues.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length,
  };

  return {
    project: {
      id: project._id,
      title: (project as any).name || (project as any).title,
      description: project.description,
      createdBy: project.createdBy,
      membersCount: project.members?.length || 0,
    },
    repositoriesCount: repositories.length,
    taskStats,
    issueStats,
    generatedAt: new Date(),
  };
};