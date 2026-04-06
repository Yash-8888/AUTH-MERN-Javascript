import bcrypt from 'bcryptjs'
import userModel from '../models/usermodel.js'
import jwt from 'jsonwebtoken'
import transporter from '../config/nodeMailer.js'
import 'dotenv/config';

export const register = async (req, res) =>{
    const { name, email, password} = req.body

    if( !name || !email || !password){
        return res.json({success: false, message: 'bad credentials'})
    }
    try {

        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.json({success: false, Message:'user already exist'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new userModel({name, email, password: hashedPassword});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET ,{expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'welcome to the site',
            text: `welcome to website, your account has been created with Email: ${email} `
        }
        await transporter.sendMail(mailOptions)

        return res.json({success: true})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const login = async (req, res)=>{
    const {password, email}= req.body

    if(!password || !email){
        return res.json({success: false, message: 'Eamill and password are required'})
    }
    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false, message: 'invalid email'})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
             return res.json({success:false, message: 'invalid password'})
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET ,{expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.json({success: true})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}


export const logOut = async (req, res)=>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        return res.json({success :true, message: 'Loged Out'})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}
//send verification OTP to the user email 
export const sendVerifyOtp = async (req, res) => {
    try {
        const {userId} = req.body

        const user = await userModel.findById(userId)

        if(user.isAccountVerified){
            return res.json({success: false, message: "Account is already verified"})
        }

        const OTP = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = OTP;
        user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification OTP',
            text: `Your OTP to verify the account is ${OTP}`
        }
        await transporter.sendMail(mailOptions)

        return res.json({success: true, message: 'verification OTP sent on email'})

    } catch (error) {
        console.log('ERROR:', error.message)
        return res.json({success: false, message: error.message})
    }
}
//verify email using otp
export const verifyEmail = async(req, res) =>{
    const {userId, OTP} = req.body

    if(!userId || !OTP){
        return res.json({success: false, message: 'Please enter otp'})
    }
    try {
        const user = await userModel.findById(userId)

        if(!user){
            return res.json({success: false, message: 'User not found'})
        }
        if(user.verifyOtp === '' || user.verifyOtp !== OTP){
            return res.json({success: false, message: 'invalid OTP'})
        }
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP Expired'})
        }
        user.isAccountVerified = true;

        user.verifyOtp = ''
        user.verifyOtpExpireAt= 0
        
        await user.save();

        return res.json({success: true, message: 'Email Verified successfully'})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}
//check is authenticated or not
export const isAuth = async (req, res)=>{
    try {
        return res.json({success: true}) ;
    } catch (error) {
        return res.json({success: false, message: error.message})  
    }
}

//send password reset otp

export const resetOtp = async(req, res)=>{
    const {email}= req.body;
    if(!email){
        return res.json({success:false, message:'email required'})
    }
    try {
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success:false, message:'user not found'})
        }
        const OTP = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = OTP;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for resetting Password is ${OTP}`
        }
        await transporter.sendMail(mailOptions)

        return res.json({success: true, message: 'otp sent to your email'})

    } catch (error) {
        return res.json({success: false, message: error.message})  
    }
}

//reset user password (for commit)

export const resetPassword = async (req, res)=>{
    const {email, OTP, newPass}= req.body;
    if(!email || !OTP || !newPass){
        return res.json({success: false, message: 'Email, OTP, password is required'})
    }
    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User not found'})
        }
        if(user.resetOtp === "" || user.resetOtp !== OTP){
            return res.json({success: false, message: 'invalid OTP'})
        }
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP Expired'})
        }

        const hashedPassword = await bcrypt.hash(newPass, 10)

        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtp = 0;

        await user.save();

        return res.json({success: true, message: 'password has been reset successfully'})
    } catch (error) {
        return res.json({success: false, message: error.message})  
    }
}