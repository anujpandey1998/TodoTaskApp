import { format } from 'date-fns'
import { useRef, useState, type PointerEvent } from 'react'
import type { Task, TaskStatus } from '../types/task'
import { Icon } from './Icon'

interface TaskItemProps {
  task: Task
  onToggle: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const completed = task.status === 'completed'
  const [swiped, setSwiped] = useState(false)
  const pointerStart = useRef<{ x: number; pointerType: string } | null>(null)

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return
    pointerStart.current = { x: event.clientX, pointerType: event.pointerType }
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return
    const distance = event.clientX - pointerStart.current.x
    if (distance < -45) setSwiped(true)
    if (distance > 45) setSwiped(false)
    pointerStart.current = null
  }

  const deleteTask = () => {
    setSwiped(false)
    onDelete(task)
  }

  return (
    <article className={`task-row ${completed ? 'task-completed' : ''}`}>
      <div className="swipe-delete">
        <button type="button" onClick={deleteTask} disabled={!swiped} aria-hidden={!swiped}>
          <Icon name="trash" size={16} />
          Delete
        </button>
      </div>
      <div
        className={`task-row-content ${swiped ? 'task-row-swiped' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { pointerStart.current = null }}
      >
        <button
          type="button"
          className="task-checkbox"
          role="checkbox"
          aria-checked={completed}
          aria-label={`${completed ? 'Mark' : 'Complete'} ${task.title}`}
          onClick={() => onToggle(task._id, completed ? 'in_progress' : 'completed')}
        >
          {completed && <Icon name="check" size={15} />}
        </button>
        <button type="button" className="task-main" onClick={() => onEdit(task)}>
          <span className="task-title">{task.title}</span>
          <span className="task-subtitle">
            <span className={`priority-dot priority-${task.priority}`} />
            {format(new Date(task.dueAt), 'h:mm a')}
            {task.description ? <span className="task-description"> · {task.description}</span> : null}
          </span>
        </button>
        <div className="task-actions">
          <button type="button" className="icon-button task-action" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>
            <Icon name="edit" size={17} />
          </button>
          <button type="button" className="icon-button task-action delete-action" onClick={deleteTask} aria-label={`Delete ${task.title}`}>
            <Icon name="trash" size={17} />
          </button>
        </div>
      </div>
    </article>
  )
}
