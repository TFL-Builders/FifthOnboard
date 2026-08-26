import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import Login from './Pages/Login'
import ForgotPass from './Pages/ForgotPass'
import CreateAcc from './Pages/CreateAcc'
// import ResetPass from './Pages/ResetPass'
import { Sidebar } from './Components/Sidebar'
import './App.css'
import { InviteTeammate } from './Pages/InviteTeammate'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Sidebar />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/create-account" element={<CreateAcc />} />
        <Route path="/invite-teammate" element={<InviteTeammate/>}/>
        
      </Routes>
    </BrowserRouter>
  )
}

export default App