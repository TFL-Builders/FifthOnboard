import AppRouter from './routes/AppRouter'
import { useAuthInit } from './hooks/useAuthInit'
import { useTheme } from './hooks/useTheme'
import useAuthStore from './stores/authStore'
import Spinner from './components/ui/Spinner'


export default function App() {

  // Re-hydrate session from the httpOnly refresh token cookie on every app load.
  // Access token is never persisted — we always mint a fresh one here.
  useAuthInit()

  // Apply dark/light mode from user.theme (DB) or OS preference when theme is null.
  useTheme()

   const { isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'var(--bg-app)' }}>
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  return <AppRouter />
}
