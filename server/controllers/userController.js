import userModel from "../models/usermodel.js";

export const getUserData = async (req, res) => {
    try {
        const {userId} = req.body;
        console.log('looking for userId:', userId)
        const user = await userModel.findById(userId)
        console.log('user found:', user)
        if(!user){
            return res.json({success: false, message: 'User not found'})
        }
        
        return res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
            })
        
    } catch (error) {
        return res.json({success: false, message: error.message})  
    }
}