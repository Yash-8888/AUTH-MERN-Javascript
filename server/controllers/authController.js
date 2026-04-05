import bcrypt from 'bcryptjs'
import userModel from '../models/usermodel.js'

export const register = async (req, res) =>{
    const { name, email, password} = req.body

    if( !name || !email || !password){
        return res.json({sucess: false, message: 'bad credentials'})
    }

    try {

        const existingUser = await userModel.findOne({email})
        if(existingUser){
            res.json({sucess: false, message:'user already exist'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new userModel({name, email, password: hashedPassword});
        await user.save();

    } catch (error) {
        res.json({sucess: false, message: error.message})
    }
}