import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SetupRoute from './SetupRoute'
import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import SetupPage from '../pages/auth/SetupPage'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import TemplatesPage from '../pages/templates/TemplatesPage'
import TemplateEditorPage from '../pages/templates/TemplateEditorPage'

function DashboardPlaceholder() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <p className="text-[18px] font-semibold">Columbus — Dashboard (coming soon)</p>
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public routes — redirect authenticated users away */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* setup — accessible to pending users only */}
        <Route path="/setup" element={<SetupRoute><SetupPage /></SetupRoute>} />

        {/* protected routes — redirect unauthenticated users away */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPlaceholder />
            </ProtectedRoute>
          }
        />

        {/* templates */}
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates/new"
          element={
            <ProtectedRoute>
              <TemplateEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates/:id"
          element={
            <ProtectedRoute>
              <TemplateEditorPage />
            </ProtectedRoute>
          }
        />

        {/* fallback routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}