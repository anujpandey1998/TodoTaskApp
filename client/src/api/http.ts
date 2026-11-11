import axios from 'axios'
import type { ApiEnvelope, Task, TaskInput, TaskStatus, TaskUpdateInput, WeekSummary } from '../types/task'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export interface TaskFilters {
  from?: string
  to?: string
  search?: string
}

export async function fetchTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const { data } = await http.get<ApiEnvelope<{ tasks: Task[] }>>('/api/tasks', { params: filters })
  return data.data.tasks
}

export async function createTask(input: TaskInput): Promise<Task> {
  const { data } = await http.post<ApiEnvelope<{ task: Task }>>('/api/tasks', input)
  return data.data.task
}

export async function updateTask(id: string, input: TaskUpdateInput): Promise<Task> {
  const { data } = await http.put<ApiEnvelope<{ task: Task }>>(`/api/tasks/${id}`, input)
  return data.data.task
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const { data } = await http.patch<ApiEnvelope<{ task: Task }>>(`/api/tasks/${id}/status`, { status })
  return data.data.task
}

export async function deleteTask(id: string): Promise<Task> {
  const { data } = await http.delete<ApiEnvelope<{ task: Task }>>(`/api/tasks/${id}`)
  return data.data.task
}

export async function fetchWeeks(): Promise<WeekSummary[]> {
  const { data } = await http.get<ApiEnvelope<{ weeks: WeekSummary[] }>>('/api/tasks/weeks')
  return data.data.weeks
}
