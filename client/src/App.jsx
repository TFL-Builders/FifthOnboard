import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Pages/Login'
import ForgotPass from './Pages/ForgotPass'
import CreateAcc from './Pages/CreateAcc'
// import ResetPass from './Pages/ResetPass'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/create-account" element={<CreateAcc />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App