import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext } from './toast-context'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const timeoutRef = useRef<number | undefined>(undefined)

  const showToast = useCallback((nextMessage: string) => {
    if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current)
    setMessage(nextMessage)
    timeoutRef.current = window.setTimeout(() => setMessage(''), 3500)
  }, [])

  useEffect(() => () => {
    if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current)
  }, [])

  const value = useMemo(() => showToast, [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`toast ${message ? 'toast-visible' : ''}`} role="status" aria-live="polite">
        {message}
      </div>
    </ToastContext.Provider>
  )
}
