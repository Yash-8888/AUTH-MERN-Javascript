import express from 'express'
import { isAuth, login, logOut, register, resetOtp, resetPassword, sendVerifyOtp, verifyEmail } from '../controllers/authcontroller.js'
import userAuth from '../middleware/userAuth.js'


const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logOut)
authRouter.post('/send-Verify-Otp', userAuth, sendVerifyOtp)
authRouter.post('/verify-account', userAuth, verifyEmail)
authRouter.post('/is-auth', userAuth, isAuth)
authRouter.post('/reset-OTP', resetOtp)
authRouter.post('/Reset-Password', resetPassword)

export default authRouter