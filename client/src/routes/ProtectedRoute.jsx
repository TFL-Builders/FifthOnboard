import { Navigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import Spinner from '../components/ui/Spinner'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
