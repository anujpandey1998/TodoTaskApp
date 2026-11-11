import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/async-handler';
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamsSchema,
  taskStatusSchema,
  updateTaskSchema,
} from '../validators/task.validators';

export const taskRouter = Router();

taskRouter.get('/weeks', asyncHandler(taskController.listWeeks));
taskRouter.post('/', validate(createTaskSchema), asyncHandler(taskController.createTask));
taskRouter.get('/', validate(listTasksQuerySchema, 'query'), asyncHandler(taskController.listTasks));
taskRouter.get(
  '/:id',
  validate(taskIdParamsSchema, 'params'),
  asyncHandler(taskController.getTask),
);
taskRouter.put(
  '/:id',
  validate(taskIdParamsSchema, 'params'),
  validate(updateTaskSchema),
  asyncHandler(taskController.updateTask),
);
taskRouter.patch(
  '/:id/status',
  validate(taskIdParamsSchema, 'params'),
  validate(taskStatusSchema),
  asyncHandler(taskController.updateTaskStatus),
);
taskRouter.delete(
  '/:id',
  validate(taskIdParamsSchema, 'params'),
  asyncHandler(taskController.deleteTask),
);
