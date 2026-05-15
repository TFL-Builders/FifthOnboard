import { createBrowserRouter, Navigate } from 'react-router-dom';

import Layout from '../components/Layout';
import PortalLayout from '../components/PortalLayout';
import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import AcceptInvitationPage from '../pages/AcceptInvitationPage';

import DashboardPage from '../pages/DashboardPage';
import OnboardingsPage from '../pages/OnboardingsPage';
import OnboardingDetailPage from '../pages/OnboardingDetailPage';
import NewOnboardingPage from '../pages/NewOnboardingPage';
import TemplatesPage from '../pages/TemplatesPage';
import TemplateEditorPage from '../pages/TemplateEditorPage';
import PeoplePage from '../pages/PeoplePage';
import MyTasksPage from '../pages/MyTasksPage';
import SettingsPage from '../pages/SettingsPage';

import HirePortalPage from '../pages/HirePortalPage';

import NotFoundPage from '../pages/errors/NotFoundPage';
import ForbiddenPage from '../pages/errors/ForbiddenPage';
import ServerErrorPage from '../pages/errors/ServerErrorPage';

const router = createBrowserRouter([
  // Public auth routes
  { path: '/login',             element: <LoginPage /> },
  { path: '/signup',            element: <SignupPage /> },
  { path: '/forgot-password',   element: <ForgotPasswordPage /> },
  { path: '/reset-password',    element: <ResetPasswordPage /> },
  { path: '/accept-invitation', element: <AcceptInvitationPage /> },

  // New hire portal (minimal layout, no sidebar)
  {
    path: '/portal',
    element: (
      <ProtectedRoute>
        <PortalLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HirePortalPage /> },
    ],
  },

  // HR admin app (full layout with sidebar)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,                       element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',                 element: <DashboardPage /> },
      { path: 'onboardings',               element: <OnboardingsPage /> },
      { path: 'onboardings/new',           element: <NewOnboardingPage /> },
      { path: 'onboardings/:id',           element: <OnboardingDetailPage /> },
      { path: 'templates',                 element: <TemplatesPage /> },
      { path: 'templates/new',             element: <TemplateEditorPage /> },
      { path: 'templates/:id',             element: <TemplateEditorPage /> },
      { path: 'people',                    element: <PeoplePage /> },
      { path: 'tasks',                     element: <MyTasksPage /> },
      { path: 'settings',                  element: <SettingsPage /> },
    ],
  },

  // Error pages
  { path: '/403', element: <ForbiddenPage /> },
  { path: '/500', element: <ServerErrorPage /> },
  { path: '*',    element: <NotFoundPage /> },
]);

export default router;
