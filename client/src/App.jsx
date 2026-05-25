// import { useEffect } from 'react'
import AppRouter from './routes/AppRouter'
// import useAuthStore from './stores/authStore'
// import { authApi } from './api/auth'
import { useAuthInit } from './hooks/useAuthInit'
import useAuthStore from './stores/authStore'
import Spinner from './components/ui/Spinner'


export default function App() {
  

  // Re-hydrate session from the httpOnly refresh token cookie on every app load.
  // Access token is never persisted — we always mint a fresh one here.

   useAuthInit() 

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
