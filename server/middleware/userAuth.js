import jwt from "jsonwebtoken";
import 'dotenv/config';

const userAuth = async (req, res, next)=>{
    const {token} = req.cookies;

    if(!token){
        return res.json({success: false, message: 'Not authorized Login again'})
    }
    try {
        
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        console.log('tokenDecode:', tokenDecode)
        if(tokenDecode.id){
            req.body = req.body || {}
            req.body.userId = tokenDecode.id
            console.log('userId set:', req.body.userId)
        }else{
            return res.json({success: false, message: 'Not authorized Login again'})
        }
        
        next();
    } catch (error) {
       return res.json({success: false, message: error.message})
    }
} 
export default userAuth;