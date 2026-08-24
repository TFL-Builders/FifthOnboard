import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import Login from './Pages/Login'
// import ForgotPass from './Pages/ForgotPass'
import CreateAcc from './Pages/CreateAcc'
import ResetPass from './Pages/ResetPass'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<ResetPass />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App