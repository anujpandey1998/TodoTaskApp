import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BottomSheet } from '../components/BottomSheet'
import { Icon } from '../components/Icon'
import { TaskForm } from '../components/TaskForm'
import { TaskItem } from '../components/TaskItem'
import { useToast } from '../hooks/useToast'
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
  useUpdateTaskStatus,
} from '../hooks/useTasks'
import type { Task, TaskFormValue, TaskInput, TaskStatus } from '../types/task'

export function SearchPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const showToast = useToast()
  const [query, setQuery] = useState<string>(() => location.state?.query ?? '')
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim())
  const [editingTask, setEditingTask] = useState<Task>()
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const tasksQuery = useTasks({ search: debouncedQuery }, Boolean(debouncedQuery))
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()
  const deleteMutation = useDeleteTask()
  const statusMutation = useUpdateTaskStatus()

  useEffect(() => {
    if (tasksQuery.isError) showToast('Search is unavailable. Please try again.')
  }, [showToast, tasksQuery.isError])

  const closeSheet = () => {
    setSheetOpen(false)
    setEditingTask(undefined)
  }

  const saveTask = async (input: TaskFormValue) => {
    try {
      if (editingTask) {
        await updateMutation.mutateAsync({ id: editingTask._id, input })
        showToast('Task updated')
      } else {
        const { endAt, ...fields } = input
        const createInput: TaskInput = {
          ...fields,
          ...(typeof endAt === 'string' ? { endAt } : {}),
        }
        await createMutation.mutateAsync(createInput)
        showToast('Task created')
      }
      closeSheet()
    } catch {
      showToast('Could not save task. Please try again.')
    }
  }

  const removeTask = async (task: Task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return
    try {
      await deleteMutation.mutateAsync(task._id)
      showToast('Task deleted')
    } catch {
      showToast('Could not delete task. Please try again.')
    }
  }

  const toggleTask = (id: string, status: TaskStatus) => {
    statusMutation.mutate({ id, status }, {
      onError: () => showToast('Could not update task status. Please try again.'),
    })
  }

  return (
    <main className="phone-shell">
      <div className="page-content">
        <header className="search-header">
          <button type="button" className="icon-button back-button" onClick={() => navigate(-1)} aria-label="Go back">
            <Icon name="left" />
          </button>
          <div className="search-field search-page-field">
            <Icon name="search" size={19} />
            <input
              autoFocus
              aria-label="Search tasks"
              placeholder="Search tasks"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button type="button" className="icon-button search-clear" onClick={() => setQuery('')} aria-label="Clear search">
                <Icon name="close" size={17} />
              </button>
            )}
          </div>
        </header>

        <div className="search-results-heading">
          <h1>{debouncedQuery ? 'Search results' : 'Find a task'}</h1>
          {debouncedQuery && !tasksQuery.isPending && !tasksQuery.isError && (
            <span>{tasksQuery.data?.length ?? 0} found</span>
          )}
        </div>

        {!debouncedQuery ? (
          <div className="empty-state search-empty">
            <div className="empty-state-icon"><Icon name="search" size={22} /></div>
            <strong>Search your tasks</strong>
            <span>Type a keyword to find a task by title or description.</span>
          </div>
        ) : tasksQuery.isPending ? (
          <div className="task-list" aria-label="Searching tasks" aria-busy="true">
            <div className="task-skeleton" />
            <div className="task-skeleton" />
            <div className="task-skeleton" />
          </div>
        ) : tasksQuery.isError ? (
          <div className="error-card" role="alert">
            <p>Search isn’t available right now.</p>
            <button type="button" className="text-button" onClick={() => void tasksQuery.refetch()}>Try again</button>
          </div>
        ) : tasksQuery.data?.length ? (
          <div className="task-list search-results">
            {tasksQuery.data.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onToggle={toggleTask}
                onEdit={(selectedTask) => {
                  setEditingTask(selectedTask)
                  setSheetOpen(true)
                }}
                onDelete={removeTask}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state search-empty">
            <div className="empty-state-icon"><Icon name="search" size={22} /></div>
            <strong>No tasks found</strong>
            <span>Try another title or keyword.</span>
          </div>
        )}
      </div>

      <BottomSheet
        open={sheetOpen}
        title="Edit task"
        onClose={closeSheet}
      >
        {editingTask && (
          <TaskForm
            key={editingTask._id}
            task={editingTask}
            saving={updateMutation.isPending || createMutation.isPending}
            onSave={saveTask}
            onCancel={closeSheet}
          />
        )}
      </BottomSheet>
    </main>
  )
}
