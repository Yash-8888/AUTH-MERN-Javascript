import mongoose from "mongoose";

const connectDB = async ()=>{

    mongoose.connection.on('connected', ()=> console.log('DataBase has connected'))

    await mongoose.connect(`${process.env.MONOGO_URL}/mern-auth`)
}

export default connectDB