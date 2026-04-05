
import mongoose from "mongoose";
 
const userSchema = new mongoose.Schema({
    name : {type: string, require:true},
    email : {type: string, require:true, unique:true},
    password : {type: string, require:true},
    verifyOtp : {type: string, default:''},
    verifyOtpExpireAt : {type: Number, default:0},
    isAccountVerifyed : {type: Boolean, default:false},
    resetOtp: {type: string, default:''},
    resetOtpExpireAt: {type: Number, default: 0}
})

const userModel = mongoose.models.user || mongoose.Model('user', userSchema);

export default userModel