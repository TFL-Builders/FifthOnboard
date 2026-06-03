import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SetupRoute from './SetupRoute'
import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import SetupPage from '../pages/auth/SetupPage'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import DashboardPage from '../pages/dashboard/DashboardPage'
import MyTasksPage from '../pages/tasks/MyTasksPage'
import TemplatesPage from '../pages/templates/TemplatesPage'
import TemplateEditorPage from '../pages/templates/TemplateEditorPage'
import TemplatePreviewPage from '../pages/templates/TemplatePreviewPage'
import OnboardingsPage from '../pages/onboardings/OnboardingsPage'
import OnboardingWizardPage from '../pages/onboardings/OnboardingWizardPage'
import OnboardingDetailPage from '../pages/onboardings/OnboardingDetailPage'
import OnboardingEditPage from '../pages/onboardings/OnboardingEditPage'
import HirePortalPage from '../pages/hire/HirePortalPage'
import HirePortalErrorPage from '../pages/hire/HirePortalErrorPage'
import PeoplePage from '../pages/people/PeoplePage'
import PersonDetailPage from '../pages/people/PersonDetailPage'
import SettingsPage from '../pages/settings/SettingsPage'
import useAuthStore from '../stores/authStore'

function DashboardGate() {
  const user = useAuthStore(s => s.user)
  const isTaskOwner = ['task_owner', 'employee'].includes(user?.role)
  if (isTaskOwner) return <Navigate to="/my-tasks" replace />
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
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
        <Route path="/dashboard" element={<DashboardGate />} />

        {/* task owner inbox */}
        <Route
          path="/my-tasks"
          element={
            <ProtectedRoute>
              <MyTasksPage />
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
          path="/templates/:id/preview"
          element={
            <ProtectedRoute>
              <TemplatePreviewPage />
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

        {/* onboardings */}
        <Route path="/onboardings" element={<ProtectedRoute><OnboardingsPage /></ProtectedRoute>} />
        <Route path="/onboardings/new" element={<ProtectedRoute><OnboardingWizardPage /></ProtectedRoute>} />
        <Route path="/onboardings/:id" element={<ProtectedRoute><OnboardingDetailPage /></ProtectedRoute>} />
        <Route path="/onboardings/:id/edit" element={<ProtectedRoute><OnboardingEditPage /></ProtectedRoute>} />

        {/* settings */}
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* people */}
        <Route path="/people" element={<ProtectedRoute><PeoplePage /></ProtectedRoute>} />
        <Route path="/people/:id" element={<ProtectedRoute><PersonDetailPage /></ProtectedRoute>} />

        {/* hire portal — no auth required, token-gated via URL */}
        <Route path="/hire/error" element={<HirePortalErrorPage />} />
        <Route path="/hire/:token" element={<HirePortalPage />} />

        {/* fallback routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}