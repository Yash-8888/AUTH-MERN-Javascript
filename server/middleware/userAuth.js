import jwt from "jsonwebtoken";

const userAuth = async (req, res, next)=>{
    const {token} = req.cookies;

    if(!token){
        res.json({success: false, message: 'Not authorized Login again'})
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        res.json({success: false, message: error.message})
    }
} 