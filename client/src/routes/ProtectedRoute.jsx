import { Navigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import Spinner from '../components/ui/Spinner'

export default function ProtectedRoute({ children }) {
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

  // unauthenticated — redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // pending user — needs to complete setup first
  if (user?.status === 'pending') {
    return <Navigate to="/setup" replace />
  }

  // active authenticated user — render the page
  return children
}