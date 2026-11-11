import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { createTask, deleteTask, fetchTasks, fetchWeeks, updateTask, updateTaskStatus } from '../api/http'
import type { TaskFilters } from '../api/http'
import type { Task, TaskInput, TaskStatus, TaskUpdateInput, WeekSummary } from '../types/task'

export const taskKeys = {
  all: ['tasks'] as const,
  list: (filters: TaskFilters) => ['tasks', 'list', filters] as const,
  weeks: ['weeks'] as const,
}

export function useTasks(filters: TaskFilters, enabled = true) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => fetchTasks(filters),
    enabled,
  })
}

export function useWeeks() {
  return useQuery({ queryKey: taskKeys.weeks, queryFn: fetchWeeks })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskInput) => createTask(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      void queryClient.invalidateQueries({ queryKey: taskKeys.weeks })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TaskUpdateInput }) => updateTask(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      void queryClient.invalidateQueries({ queryKey: taskKeys.weeks })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      void queryClient.invalidateQueries({ queryKey: taskKeys.weeks })
    },
  })
}

interface StatusContext {
  taskSnapshots: Array<[readonly unknown[], Task[] | undefined]>
  weeksSnapshot: WeekSummary[] | undefined
}

function getWeekKey(task: Task) {
  const date = new Date(task.dueAt)
  const daysSinceMonday = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - daysSinceMonday)
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString()
}

function updateCachedStatus(queryClient: QueryClient, id: string, status: TaskStatus) {
  queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.all }, (tasks) =>
    tasks?.map((task) => (task._id === id ? { ...task, status } : task)),
  )
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, { id: string; status: TaskStatus }, StatusContext>({
    mutationFn: ({ id, status }) => updateTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      await queryClient.cancelQueries({ queryKey: taskKeys.weeks })

      const taskSnapshots = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all })
      const weeksSnapshot = queryClient.getQueryData<WeekSummary[]>(taskKeys.weeks)
      const cachedTask = taskSnapshots.flatMap(([, tasks]) => tasks ?? []).find((task) => task._id === id)

      updateCachedStatus(queryClient, id, status)
      if (cachedTask) {
        const key = getWeekKey(cachedTask)
        queryClient.setQueryData<WeekSummary[]>(taskKeys.weeks, (weeks) =>
          weeks?.map((week) => {
            if (new Date(week.weekStart).toISOString() !== key) return week
            const completedDelta = status === 'completed' ? 1 : -1
            return {
              ...week,
              completed: week.completed + completedDelta,
              open: week.open - completedDelta,
            }
          }),
        )
      }

      return { taskSnapshots, weeksSnapshot }
    },
    onError: (_error, _variables, context) => {
      context?.taskSnapshots.forEach(([queryKey, tasks]) => {
        queryClient.setQueryData(queryKey, tasks)
      })
      if (context?.weeksSnapshot) queryClient.setQueryData(taskKeys.weeks, context.weeksSnapshot)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.weeks })
    },
  })
}
