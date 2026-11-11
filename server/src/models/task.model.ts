import { Schema, model } from 'mongoose';

export const priorities = ['low', 'medium', 'high'] as const;
export const statuses = ['in_progress', 'completed'] as const;

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueAt: { type: Date, required: true },
    endAt: { type: Date },
    priority: {
      type: String,
      enum: priorities,
      default: 'medium',
      required: true,
    },
    status: {
      type: String,
      enum: statuses,
      default: 'in_progress',
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

taskSchema.index({ title: 'text', description: 'text' });

export const Task = model('Task', taskSchema);
