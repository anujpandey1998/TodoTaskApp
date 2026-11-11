import { addHours, format, startOfHour } from 'date-fns'
import { useState, type FormEvent } from 'react'
import type { Task, TaskFormValue, TaskPriority } from '../types/task'

interface TaskFormProps {
  task?: Task
  saving: boolean
  onSave: (input: TaskFormValue) => Promise<void>
  onCancel: () => void
}

function getInitialValues(task?: Task) {
  const now = new Date()
  const suggestedTime = addHours(startOfHour(now), 1)
  const dueAt = task ? new Date(task.dueAt) : suggestedTime

  return {
    title: task?.title ?? '',
    date: format(dueAt, 'yyyy-MM-dd'),
    startTime: format(dueAt, 'HH:mm'),
    endTime: task?.endAt ? format(new Date(task.endAt), 'HH:mm') : '',
    priority: task?.priority ?? 'medium' as TaskPriority,
    description: task?.description ?? '',
  }
}

const priorities: TaskPriority[] = ['low', 'medium', 'high']

export function TaskForm({ task, saving, onSave, onCancel }: TaskFormProps) {
  const [values, setValues] = useState(() => getInitialValues(task))
  const [titleError, setTitleError] = useState('')
  const [timeError, setTimeError] = useState('')

  const setField = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (field === 'title') setTitleError('')
    if (field === 'date' || field === 'startTime' || field === 'endTime') setTimeError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = values.title.trim()
    if (!title) {
      setTitleError('Task title is required.')
      return
    }

    const dueAt = new Date(`${values.date}T${values.startTime}`)
    if (Number.isNaN(dueAt.getTime())) {
      setTimeError('Choose a valid date and start time.')
      return
    }

    const endDate = values.endTime ? new Date(`${values.date}T${values.endTime}`) : undefined
    if (endDate && Number.isNaN(endDate.getTime())) {
      setTimeError('Choose a valid end time.')
      return
    }

    await onSave({
      title,
      dueAt: dueAt.toISOString(),
      ...(endDate ? { endAt: endDate.toISOString() } : task ? { endAt: null } : {}),
      priority: values.priority,
      ...(values.description.trim() ? { description: values.description.trim() } : task ? { description: '' } : {}),
    })
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <label className="form-field">
        <span>Task title <span className="required-mark">*</span></span>
        <input
          autoFocus
          type="text"
          value={values.title}
          maxLength={200}
          placeholder="What do you need to do?"
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? 'title-error' : undefined}
          onChange={(event) => setField('title', event.target.value)}
        />
        {titleError && <small className="field-error" id="title-error">{titleError}</small>}
      </label>

      <fieldset className="form-field time-fieldset">
        <legend>Set time</legend>
        <label className="time-input">
          <span><span className="time-dot" />Start</span>
          <input
            type="time"
            value={values.startTime}
            aria-label="Start time"
            onChange={(event) => setField('startTime', event.target.value)}
            required
          />
        </label>
        <label className="time-input">
          <span><span className="time-dot time-dot-end" />Ends</span>
          <input
            type="time"
            value={values.endTime}
            aria-label="End time"
            onChange={(event) => setField('endTime', event.target.value)}
          />
        </label>
      </fieldset>

      <label className="form-field">
        <span>Set date</span>
        <div className="date-input">
          <input
            type="date"
            value={values.date}
            aria-label="Task date"
            onChange={(event) => setField('date', event.target.value)}
            required
          />
        </div>
        {timeError && <small className="field-error">{timeError}</small>}
      </label>

      <fieldset className="form-field priority-field">
        <legend>Priority</legend>
        <div className="priority-segment" role="radiogroup" aria-label="Task priority">
          {priorities.map((priority) => (
            <button
              type="button"
              key={priority}
              role="radio"
              aria-checked={values.priority === priority}
              className={`priority-choice ${values.priority === priority ? 'priority-choice-active' : ''}`}
              onClick={() => setField('priority', priority)}
            >
              <span className={`priority-dot priority-${priority}`} />
              {priority[0].toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="form-field">
        <span>Description <span className="optional-label">Optional</span></span>
        <textarea
          rows={3}
          maxLength={5000}
          value={values.description}
          placeholder="Add a few details..."
          onChange={(event) => setField('description', event.target.value)}
        />
      </label>

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? 'Saving...' : task ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  )
}
