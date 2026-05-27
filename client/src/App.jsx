import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Login'
import EmailVerify from './Pages/EmailVerify'
import ResetPassword from './Pages/ResetPassword'
import { ToastContainer} from 'react-toastify';


const App = () => {
  return (
    <div className=''>
      <ToastContainer/>
        <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/EmailVerify' element={<EmailVerify />} />
        <Route path='/ResetPassword' element={<ResetPassword />} />
      </Routes>
      
    </div>
  )
}

export default App