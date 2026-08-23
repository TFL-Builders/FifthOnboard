import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import Login from './Pages/Login'
// import ForgotPass from './Pages/ForgotPass'
import CreateAcc from './Pages/CreateAcc'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<CreateAcc />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App