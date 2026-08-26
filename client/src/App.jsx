import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import CreateAccount from './pages/auth/CreateAccount'
import ForgotPassword from './pages/auth/ForgotPassword'
import Dashboard from './pages/app/Dashboard'
import Layout from './layouts/Layout'
import { AuthProvider } from './context/AuthContext'
import './App.css'
// import { InviteTeammate } from './Components/InviteTeammate' in case of editing

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* <Route path="/invite" element={<InviteTeammate />} /> in the event of editing required */}


          {/* App routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
