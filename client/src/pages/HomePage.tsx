import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
  isSameWeek,
  startOfWeek,
} from 'date-fns'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomSheet } from '../components/BottomSheet'
import { Icon } from '../components/Icon'
import { ProgressBar } from '../components/ProgressBar'
import { SearchInput } from '../components/SearchInput'
import { SummaryCard } from '../components/SummaryCard'
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

const weekOptions = { weekStartsOn: 1 as const }

export function HomePage() {
  const [today] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(() => today)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const navigate = useNavigate()
  const showToast = useToast()

  const weekStart = startOfWeek(selectedDay, weekOptions)
  const weekEnd = endOfWeek(selectedDay, weekOptions)
  const filters = { from: weekStart.toISOString(), to: weekEnd.toISOString() }
  const tasksQuery = useTasks(filters)
  const tasks = tasksQuery.data ?? []
  const tasksForDay = tasks.filter((task) => isSameDay(new Date(task.dueAt), selectedDay))
  const completed = tasks.filter((task) => task.status === 'completed').length
  const pending = tasks.length - completed

  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()
  const deleteMutation = useDeleteTask()
  const statusMutation = useUpdateTaskStatus()

  useEffect(() => {
    if (tasksQuery.isError) showToast('Could not load your tasks. Please try again.')
  }, [showToast, tasksQuery.isError])

  const closeSheet = () => {
    setSheetOpen(false)
    setEditingTask(undefined)
  }

  const openCreate = () => {
    setEditingTask(undefined)
    setSheetOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setSheetOpen(true)
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

  const handleDelete = async (task: Task) => {
    const confirmed = window.confirm(`Delete "${task.title}"? This cannot be undone.`)
    if (!confirmed) return

    try {
      await deleteMutation.mutateAsync(task._id)
      showToast('Task deleted')
    } catch {
      showToast('Could not delete task. Please try again.')
    }
  }

  const toggleStatus = (id: string, status: TaskStatus) => {
    statusMutation.mutate({ id, status }, {
      onError: () => showToast('Could not update task status. Please try again.'),
    })
  }

  const selectedWeekTitle = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`
  const isCurrentWeek = isSameWeek(selectedDay, today, weekOptions)

  return (
    <main className="phone-shell">
      <div className="home-content">
        <header className="home-header">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="brand-copy">
            <p className="eyebrow">YOUR DAY, IN CONTROL</p>
            <h1>My Tasks</h1>
          </div>
          <button className="avatar-button" aria-label="Profile">A</button>
        </header>

        <SearchInput />

        <section className="week-section" aria-label="Choose a day">
          <div className="section-topline">
            <div className="week-caption">
              <h2>{isCurrentWeek ? 'This week' : 'Selected week'}</h2>
              <span>{selectedWeekTitle}</span>
            </div>
            <div className="week-controls">
              <button
                className="icon-button"
                aria-label="Previous week"
                onClick={() => setSelectedDay((day) => addWeeks(day, -1))}
              >
                <Icon name="left" size={18} />
              </button>
              <button
                className="icon-button"
                aria-label="Next week"
                onClick={() => setSelectedDay((day) => addWeeks(day, 1))}
              >
                <Icon name="right" size={18} />
              </button>
            </div>
          </div>
          <div className="date-strip">
            {Array.from({ length: 7 }, (_, index) => {
              const date = addDays(weekStart, index)
              const active = isSameDay(date, selectedDay)
              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  className={`date-cell ${active ? 'date-cell-active' : ''}`}
                  aria-pressed={active}
                  aria-label={format(date, 'EEEE, MMMM d')}
                  onClick={() => setSelectedDay(date)}
                >
                  <span>{format(date, 'EEE')}</span>
                  <strong>{format(date, 'd')}</strong>
                  {active && <i aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        </section>

        {tasksQuery.isError ? (
          <div className="error-card" role="alert">
            <p>We couldn’t load your tasks.</p>
            <button className="text-button" onClick={() => void tasksQuery.refetch()}>Try again</button>
          </div>
        ) : (
          <>
            <section className="summary-grid grid grid-cols-2" aria-label="Weekly task summary">
              <SummaryCard
                label="Task Complete"
                count={completed}
                caption="This Week"
                tone="blue"
                icon={<span className="summary-check"><Icon name="check" size={15} /></span>}
                loading={tasksQuery.isPending}
              />
              <SummaryCard
                label="Task Pending"
                count={pending}
                caption="This Week"
                tone="pink"
                icon={<span className="summary-pending"><Icon name="clock" size={15} /></span>}
                loading={tasksQuery.isPending}
              />
            </section>

            <section className="progress-section">
              <div className="section-topline">
                <h2>Weekly Progress</h2>
                <span className="progress-percent">{tasksQuery.isPending ? '—' : `${tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%`}</span>
              </div>
              {tasksQuery.isPending ? (
                <div className="progress-track progress-skeleton" aria-label="Loading progress" />
              ) : (
                <>
                  <ProgressBar value={completed} max={tasks.length} />
                  <p>{completed} of {tasks.length} tasks completed</p>
                </>
              )}
            </section>

            <section className="today-section">
              <div className="section-topline task-section-heading">
                <div>
                  <h2>{isSameDay(selectedDay, today) ? 'Tasks Today' : format(selectedDay, 'EEEE, MMM d')}</h2>
                  <span>{tasksForDay.length} {tasksForDay.length === 1 ? 'task' : 'tasks'}</span>
                </div>
                <button className="view-all-link" onClick={() => navigate('/weeks')}>View All <span aria-hidden="true">→</span></button>
              </div>

              {tasksQuery.isPending ? (
                <div className="task-list" aria-label="Loading tasks" aria-busy="true">
                  {Array.from({ length: 3 }, (_, index) => <div className="task-skeleton" key={index} />)}
                </div>
              ) : tasksForDay.length ? (
                <div className="task-list">
                  {tasksForDay.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onToggle={toggleStatus}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon"><Icon name="check" size={22} /></div>
                  <strong>Nothing planned yet</strong>
                  <span>Enjoy the breathing room or add a task.</span>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <button className="floating-add" onClick={openCreate} aria-label="Add task">
        <Icon name="plus" size={25} />
      </button>

      <BottomSheet
        open={sheetOpen}
        title={editingTask ? 'Edit task' : 'Add new task'}
        onClose={closeSheet}
      >
        <TaskForm
          key={editingTask?._id ?? 'new'}
          task={editingTask}
          saving={createMutation.isPending || updateMutation.isPending}
          onSave={saveTask}
          onCancel={closeSheet}
        />
      </BottomSheet>
    </main>
  )
}
