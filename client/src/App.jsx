import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import CreateAccount from './pages/auth/CreateAccount'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPass from './pages/auth/ResetPass'
import AcceptInvite from './pages/auth/AcceptInvite'
import Dashboard from './pages/app/Dashboard'
import Layout from './layouts/Layout'
import { Profile } from './pages/app/Profile'
import { Templates } from './pages/app/Templates'
import { Onboardings } from './pages/app/Onboardings'
// import { Member } from './pages/app/Member' I'm not sure on how to work with what you did
import { Settings } from './pages/app/Settings'
import { HirePortal } from './pages/public/HirePortal'
import { OnboardingsProvider } from './context/OnboardingsContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import { People } from './pages/app/People'
import './App.css'

// import { InviteTeammate } from './Components/InviteTeammate' in case of editing

function App() {
  return (
    <AuthProvider>
      <OnboardingsProvider>
        <BrowserRouter>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPass />} />
            <Route path="/accept-invite/:token" element={<AcceptInvite />} />
            {/* <Route path="/invite" element={<InviteTeammate />} /> in the event of editing required */}

            {/* Public hire portal — no login, reached only via the unique link sent after launch */}
            <Route path="/hire/:token" element={<HirePortal />} />

            {/* Protected app routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile-page" element={<Profile/>}/>
                <Route path="/templates" element={<Templates/>}/>
                <Route path="/onboardings" element={<Onboardings/>}/>
                <Route path="/people" element={<People/>}/>
                <Route path="/settings" element={<Settings/>}/>
              </Route>
            </Route>

            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </OnboardingsProvider>
    </AuthProvider>
  )
}

export default App
