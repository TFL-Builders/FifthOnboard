// import { useEffect } from 'react'
import AppRouter from './routes/AppRouter'
// import useAuthStore from './stores/authStore'
// import { authApi } from './api/auth'
import { useAuthInit } from './hooks/useAuthInit'

export default function App() {
  

  // Re-hydrate session from the httpOnly refresh token cookie on every app load.
  // Access token is never persisted — we always mint a fresh one here.

   useAuthInit() 

  return <AppRouter />
}
