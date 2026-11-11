import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import type { WeekSummary } from '../types/task'
import { useTasks } from '../hooks/useTasks'
import { useToast } from '../hooks/useToast'
import { Icon } from './Icon'
import { TaskItem } from './TaskItem'

interface WeekCardProps {
  week: WeekSummary
  initiallyExpanded?: boolean
  onToggleTask: Parameters<typeof TaskItem>[0]['onToggle']
  onEditTask: Parameters<typeof TaskItem>[0]['onEdit']
  onDeleteTask: Parameters<typeof TaskItem>[0]['onDelete']
}

export function WeekCard({
  week,
  initiallyExpanded = false,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: WeekCardProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded)
  const showToast = useToast()
  const start = new Date(week.weekStart)
  const end = new Date(week.weekEnd)
  end.setUTCHours(23, 59, 59, 999)
  const startLabel = format(new Date(start.getTime() + start.getTimezoneOffset() * 60000), 'd MMM')
  const endLabel = format(new Date(new Date(week.weekEnd).getTime() + new Date(week.weekEnd).getTimezoneOffset() * 60000), 'd MMM')
  const tasksQuery = useTasks(
    { from: start.toISOString(), to: end.toISOString() },
    expanded,
  )

  useEffect(() => {
    if (tasksQuery.isError) showToast('Could not load this week’s tasks.')
  }, [showToast, tasksQuery.isError])

  return (
    <article className={`week-card ${expanded ? 'week-card-expanded' : ''}`}>
      <button
        type="button"
        className="week-card-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="week-card-date">
          <strong>{startLabel} – {endLabel}</strong>
          <span>{week.total} {week.total === 1 ? 'task' : 'tasks'}</span>
        </span>
        <span className="week-card-counts">
          <span className="week-open-count">{week.open} open</span>
          <span className="week-done-count">{week.completed} done</span>
        </span>
        <Icon name="right" className={expanded ? 'week-chevron week-chevron-open' : 'week-chevron'} size={18} />
      </button>
      {expanded && (
        <div className="week-card-tasks">
          {tasksQuery.isPending ? (
            <div className="task-list" aria-label="Loading weekly tasks" aria-busy="true">
              <div className="task-skeleton" />
              <div className="task-skeleton" />
            </div>
          ) : tasksQuery.isError ? (
            <p className="week-load-error" role="alert">
              Couldn’t load this week’s tasks.{' '}
              <button type="button" className="text-button" onClick={() => void tasksQuery.refetch()}>Try again</button>
            </p>
          ) : tasksQuery.data?.length ? (
            tasksQuery.data.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))
          ) : (
            <p className="week-empty">No tasks this week.</p>
          )}
        </div>
      )}
    </article>
  )
}
