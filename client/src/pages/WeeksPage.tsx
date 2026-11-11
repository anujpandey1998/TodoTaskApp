import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomSheet } from '../components/BottomSheet'
import { Icon } from '../components/Icon'
import { TaskForm } from '../components/TaskForm'
import { useToast } from '../hooks/useToast'
import {
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
  useUpdateTaskStatus,
  useWeeks,
} from '../hooks/useTasks'
import type { Task, TaskFormValue, TaskInput, TaskStatus } from '../types/task'
import { WeekCard } from '../components/WeekCard'

function currentUtcWeekStart() {
  const date = new Date()
  const daysSinceMonday = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - daysSinceMonday)
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString()
}

export function WeeksPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [editingTask, setEditingTask] = useState<Task>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const weeksQuery = useWeeks()
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()
  const deleteMutation = useDeleteTask()
  const statusMutation = useUpdateTaskStatus()
  const [currentWeek] = useState(currentUtcWeekStart)

  useEffect(() => {
    if (weeksQuery.isError) showToast('Could not load your weekly overview.')
  }, [showToast, weeksQuery.isError])

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
      showToast(editingTask ? 'Could not update task. Please try again.' : 'Could not create task. Please try again.')
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
        <header className="subpage-header">
          <button type="button" className="icon-button back-button" onClick={() => navigate(-1)} aria-label="Go back">
            <Icon name="left" />
          </button>
          <div>
            <p className="eyebrow">YOUR OVERVIEW</p>
            <h1>All weeks</h1>
          </div>
        </header>

        {weeksQuery.isPending ? (
          <div className="weeks-loading" aria-label="Loading weeks" aria-busy="true">
            <div className="week-card-skeleton" />
            <div className="week-card-skeleton" />
            <div className="week-card-skeleton" />
          </div>
        ) : weeksQuery.isError ? (
          <div className="error-card" role="alert">
            <p>We couldn’t load your weeks.</p>
            <button type="button" className="text-button" onClick={() => void weeksQuery.refetch()}>Try again</button>
          </div>
        ) : weeksQuery.data?.length ? (
          <section className="weeks-list" aria-label="Weekly task groups">
            {weeksQuery.data.map((week) => (
              <WeekCard
                key={week.weekStart}
                week={week}
                initiallyExpanded={week.weekStart === currentWeek}
                onToggleTask={toggleTask}
                onEditTask={(task) => {
                  setEditingTask(task)
                  setSheetOpen(true)
                }}
                onDeleteTask={removeTask}
              />
            ))}
          </section>
        ) : (
          <div className="empty-state weeks-empty">
            <div className="empty-state-icon"><Icon name="calendar" size={22} /></div>
            <strong>No weeks to show yet</strong>
            <span>Add a task and it will appear here.</span>
          </div>
        )}
      </div>

      <BottomSheet open={sheetOpen} title="Edit task" onClose={closeSheet}>
        {editingTask && (
          <TaskForm
            key={editingTask._id}
            task={editingTask}
            saving={updateMutation.isPending}
            onSave={saveTask}
            onCancel={closeSheet}
          />
        )}
      </BottomSheet>
    </main>
  )
}
