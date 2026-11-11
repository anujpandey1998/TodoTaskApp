import type { RequestHandler } from 'express';
import * as taskService from '../services/task.service';
import { HttpError } from '../middleware/error.middleware';

export const createTask: RequestHandler = async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.status(201).json({ success: true, data: { task } });
};

export const listTasks: RequestHandler = async (req, res) => {
  const tasks = await taskService.listTasks(req.query);
  res.status(200).json({ success: true, data: { tasks } });
};

export const getTask: RequestHandler = async (req, res) => {
  const task = await taskService.findTaskById(req.params.id);
  if (!task) throw new HttpError(404, 'Task not found');
  res.status(200).json({ success: true, data: { task } });
};

export const updateTask: RequestHandler = async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  if (!task) throw new HttpError(404, 'Task not found');
  res.status(200).json({ success: true, data: { task } });
};

export const updateTaskStatus: RequestHandler = async (req, res) => {
  const task = await taskService.updateTaskStatus(req.params.id, req.body.status);
  if (!task) throw new HttpError(404, 'Task not found');
  res.status(200).json({ success: true, data: { task } });
};

export const deleteTask: RequestHandler = async (req, res) => {
  const task = await taskService.deleteTask(req.params.id);
  if (!task) throw new HttpError(404, 'Task not found');
  res.status(200).json({ success: true, data: { task } });
};

export const listWeeks: RequestHandler = async (_req, res) => {
  const weeks = await taskService.listWeeks();
  res.status(200).json({ success: true, data: { weeks } });
};
