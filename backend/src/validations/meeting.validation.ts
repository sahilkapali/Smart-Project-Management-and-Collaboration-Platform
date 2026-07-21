import { z } from 'zod';


const objectIdRule = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID format');

export const createMeetingSchema = z.object({
  title: z.string()
    .min(3, 'Meeting title must be at least 3 characters long')
    .max(100, 'Meeting title cannot exceed 100 characters'),
  
  description: z.string().optional(),
  
  
  meetingLink: z.string().url('Invalid meeting link URL').optional().or(z.literal('')),
  
  projectId: objectIdRule,
  
  participants: z.array(objectIdRule).default([]),
  
  
  startTime: z.coerce.date({
    message: 'Start time must be a valid date',
  }),
  endTime: z.coerce.date({
    message: 'End time must be a valid date',
  }),

}).refine((data) => data.endTime > data.startTime, {
  message: 'Meeting end time must be later than the start time',
  path: ['endTime'], 
});

export const updateMeetingSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  projectId: objectIdRule.optional(),
  participants: z.array(objectIdRule).optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true; 
}, {
  message: 'Meeting end time must be later than the start time',
  path: ['endTime'],
});