import { createContext } from 'react'

export type ToastContextValue = (message: string) => void

export const ToastContext = createContext<ToastContextValue | null>(null)
