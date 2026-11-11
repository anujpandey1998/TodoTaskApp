export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'in_progress' | 'completed'

export interface Task {
  _id: string
  title: string
  description?: string
  dueAt: string
  endAt?: string
  priority: TaskPriority
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface TaskInput {
  title: string
  description?: string
  dueAt: string
  endAt?: string
  priority: TaskPriority
}

export type TaskUpdateInput = Omit<Partial<TaskInput>, 'endAt'> & {
  endAt?: string | null
}

export type TaskFormValue = Omit<TaskInput, 'endAt'> & { endAt?: string | null }

export interface WeekSummary {
  weekStart: string
  weekEnd: string
  open: number
  completed: number
  total: number
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
}
