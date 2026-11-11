import type { FilterQuery } from 'mongoose';
import { Task } from '../models/task.model';

type TaskFilter = FilterQuery<typeof Task>;

export interface ListTaskFilters {
  search?: string;
  from?: Date;
  to?: Date;
}

export const createTask = (task: Record<string, unknown>) => Task.create(task);

export const listTasks = ({ search, from, to }: ListTaskFilters) => {
  const filter: TaskFilter = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (from || to) {
    filter.dueAt = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    };
  }

  return Task.find(filter).sort({ dueAt: 1, createdAt: -1 }).exec();
};

export const findTaskById = (id: string) => Task.findById(id).exec();

export const updateTask = (id: string, updates: Record<string, unknown>) => {
  const setUpdates = { ...updates };
  const endAt = setUpdates.endAt;
  delete setUpdates.endAt;

  if (endAt !== undefined && endAt !== null) {
    setUpdates.endAt = endAt;
  }

  const update = {
    ...(Object.keys(setUpdates).length > 0 ? { $set: setUpdates } : {}),
    ...(endAt === null ? { $unset: { endAt: 1 } } : {}),
  };

  return Task.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).exec();
};

export const updateTaskStatus = (id: string, status: 'in_progress' | 'completed') =>
  Task.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  ).exec();

export const deleteTask = (id: string) => Task.findByIdAndDelete(id).exec();

export const listWeeks = () =>
  Task.aggregate<{
    weekStart: Date;
    weekEnd: Date;
    open: number;
    completed: number;
    total: number;
  }>([
    {
      $group: {
        _id: {
          $dateTrunc: {
            date: '$dueAt',
            unit: 'week',
            startOfWeek: 'monday',
            timezone: 'UTC',
          },
        },
        open: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        total: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        weekStart: '$_id',
        weekEnd: {
          $dateAdd: { startDate: '$_id', unit: 'day', amount: 6 },
        },
        open: 1,
        completed: 1,
        total: 1,
      },
    },
    { $sort: { weekStart: -1 } },
  ]).exec();
