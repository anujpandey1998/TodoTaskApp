import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ToastProvider } from './components/ToastProvider'
import { OnboardingPage } from './pages/OnboardingPage'
import { WeeksPage } from './pages/WeeksPage'
import { SearchPage } from './pages/SearchPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function readOnboardingState() {
  try {
    return window.localStorage.getItem('todo-list:onboarding-complete') === 'true'
  } catch (error) {
    console.warn('Could not read onboarding state from local storage.', error)
    return true
  }
}

function AppRoutes() {
  const [onboardingComplete, setOnboardingComplete] = useState(readOnboardingState)

  const completeOnboarding = () => {
    try {
      window.localStorage.setItem('todo-list:onboarding-complete', 'true')
    } catch (error) {
      console.warn('Could not save onboarding state to local storage.', error)
    }
    setOnboardingComplete(true)
  }

  if (!onboardingComplete) {
    return <OnboardingPage onComplete={completeOnboarding} />
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/weeks" element={<WeeksPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
