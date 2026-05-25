import { Navigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import Spinner from '../components/ui/Spinner'

export default function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'var(--bg-app)' }}
      >
        <Spinner size="lg" className="text-primary" />
      </div>
    )
  }

  // pending user — needs to complete setup
  if (isAuthenticated && user?.status === 'pending') {
    return <Navigate to="/setup" replace />
  }

  // fully authenticated active user — already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // unauthenticated — render the page
  return children
}