import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import CreateAccount from './pages/auth/CreateAccount'
import ForgotPassword from './pages/auth/ForgotPassword'
import Dashboard from './pages/app/Dashboard'
import Layout from './layouts/Layout'
import { Profile } from './pages/app/Profile'
import { Templates } from './pages/app/Templates'
import { Onboardings } from './pages/app/Onboardings'
import { Member } from './pages/app/Member'
import { Settings } from './pages/app/Settings'
import './App.css'

// import { InviteTeammate } from './Components/InviteTeammate' in case of editing

function App() {
  return (
    
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
            <Route path="/profile-page" element={<Profile/>}/>
            <Route path="/templates" element={<Templates/>}/>
            <Route path="/onboardings" element={<Onboardings/>}/>
            <Route path="/people" element={<Member/>}/>
            <Route path="/settings" element={<Settings/>}/>

          </Route>
          
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    
  )
}

export default App
