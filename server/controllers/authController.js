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
export const sendVerifyOtp = async (req, res) =>{
    try {
        const {userId} = req.body

        const user = await userModel.findById(userId)

        if (user.isAccountVerified){
            res.json({success: false, message: "Account is already verified"})
        }
        //OPT generater
        const OTP = String(Math.floor (100000 + Math.random() *900000));

        user.verifyOtp = opt;
        user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification OPT',
            text: `Your OPT to verify the account is ${OTP}`
        }
        await transporter.sendMail(mailOptions)

        res.json({success: true, message: 'verification OTP sent on email'})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const verifyEmail = async(req, res) =>{
    const {userId, OTP} = req.body

    if(!userId || !OPT){
        return res.json9({success: false, message: 'Please enter a valid otp'})
    }
    try {
        const user = await userModel.findById(userId)

        if(!user){
            return res.json9({success: false, message: 'User not found'})
        }
        if(user.verifyOtp === '' || user.verifyOtp !== OTP){
            return res.json9({success: false, message: 'invalid OTP'})
        }
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json9({success: false, message: 'OTP Expired'})
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