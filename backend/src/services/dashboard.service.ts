import mongoose from 'mongoose';
//import Issue from '../models/issue.models';

export const calculateSprintMetrics = async (sprintId: string) => {
  const sprintObjectId = new mongoose.Types.ObjectId(sprintId);

  const metrics = await Issue.aggregate([
    { $match: { sprintId: sprintObjectId } },
    {
      $facet: {
        
        performance: [
          {
            $group: {
              _id: null,
              totalTasks: { $sum: 1 },
              completedTasks: {
                $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] }
              },
              committedStoryPoints: { $sum: { $ifNull: ['$storyPoints', 0] } },
              completedStoryPoints: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Done'] }, { $ifNull: ['$storyPoints', 0] }, 0]
                }
              }
            }
          }
        ],
        
        defects: [
          {
            $group: {
              _id: null,
              totalDefects: {
                $sum: { $cond: [{ $eq: ['$type', 'Bug'] }, 1, 0] }
              }
            }
          }
        ]
      }
    }
  ]);

  const perf = metrics[0].performance[0] || { totalTasks: 0, completedTasks: 0, committedStoryPoints: 0, completedStoryPoints: 0 };
  const def = metrics[0].defects[0] || { totalDefects: 0 };

  const completionRate = perf.committedStoryPoints > 0 
    ? Math.round((perf.completedStoryPoints / perf.committedStoryPoints) * 100) 
    : 0;

  const defectDensity = perf.committedStoryPoints > 0 
    ? parseFloat((def.totalDefects / perf.committedStoryPoints).toFixed(2)) 
    : 0;

  return {
    sprintId,
    totalTasks: perf.totalTasks,
    completedTasks: perf.completedTasks,
    committedStoryPoints: perf.committedStoryPoints,
    completedStoryPoints: perf.completedStoryPoints,
    completionRate,
    totalDefects: def.totalDefects,
    defectDensity
  };
};