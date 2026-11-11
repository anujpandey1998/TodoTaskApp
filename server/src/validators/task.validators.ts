import { z } from 'zod';
import { priorities, statuses } from '../models/task.model';

const dateInput = z.string().datetime({ offset: true }).transform((value) => new Date(value));
const queryDateInput = z.union([z.iso.date(), z.iso.datetime({ offset: true })]);

export const taskIdParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid task id'),
});

const taskFieldsSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(5000).optional(),
  dueAt: dateInput,
  endAt: dateInput.optional(),
  priority: z.enum(priorities).default('medium'),
  status: z.enum(statuses).default('in_progress'),
});

export const createTaskSchema = taskFieldsSchema;
export const updateTaskSchema = taskFieldsSchema
  .omit({ priority: true, status: true })
  .partial()
  .extend({
    endAt: dateInput.nullable().optional(),
    priority: z.enum(priorities).optional(),
    status: z.enum(statuses).optional(),
  })
  .refine((task) => Object.keys(task).length > 0, 'At least one field must be provided');

export const taskStatusSchema = z.object({
  status: z.enum(statuses),
});

export const listTasksQuerySchema = z.object({
  search: z.string().trim().optional(),
  from: queryDateInput.transform((value) => new Date(value)).optional(),
  to: queryDateInput.transform((value) => {
    const date = new Date(value);
    if (value.length === 10) date.setUTCHours(23, 59, 59, 999);
    return date;
  }).optional(),
}).refine((query) => !query.from || !query.to || query.from <= query.to, {
  path: ['to'],
  message: 'The to date must be on or after the from date',
});
