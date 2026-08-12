import Project from '../models/project.models';
import Task from '../models/task.models';
import Repository from '../models/repository.models';
import Issue from '../models/issue.models';
import Meeting from '../models/meeting.models';

export const getDashboardMetricsService = async (userId: string) => {
  const now = new Date();

  const accessibleProjects = await Project.find({
    $or: [
      { createdBy: userId },
      { members: userId }
    ]
  }).select('_id');

  const projectIds = accessibleProjects.map((p) => p._id);

 
  const tasks = await Task.find({ project: { $in: projectIds } });

  let completedTasks = 0;
  let inProgressTasks = 0;
  let pendingTodoTasks = 0;
  let overdueTasks = 0;

  tasks.forEach((task) => {
    
    const status = task.status as string; 
    
    if (status === 'Completed') completedTasks++;
    else if (status === 'In Progress') inProgressTasks++;
    else if (status === 'Todo' || status === 'Pending') pendingTodoTasks++;

    if (task.dueDate && new Date(task.dueDate) < now && status !== 'Completed') {
      overdueTasks++;
    }
  });

 
  const repositories = await Repository.find({ project: { $in: projectIds } }).select('_id');
  const repositoryIds = repositories.map((r) => r._id);

  const issues = await Issue.find({ repository: { $in: repositoryIds } });
  
  let openIssues = 0;
  let resolvedIssues = 0;

  issues.forEach((issue) => {
    const status = issue.status as string;
    if (status === 'Open') openIssues++;
    else if (status === 'Resolved' || status === 'Closed') resolvedIssues++;
  });

  
  const upcomingMeetings = await Meeting.countDocuments({
    $or: [
      { project: { $in: projectIds } },
      { participants: userId }
    ],
    startTime: { $gt: now }
  });

  
  return {
    totalProjects: accessibleProjects.length,
    totalTasks: tasks.length,
    completedTasks,
    inProgressTasks,
    pendingTodoTasks,
    overdueTasks,
    totalIssues: issues.length,
    openIssues,
    resolvedIssues,
    repositoriesCount: repositories.length,
    upcomingMeetings
  };
};