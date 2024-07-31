import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
    first_name:{
        type:String
    },
    last_name:{
        type:String
    },
    email:{
        type:String,
        unique:true,
        trim:true
    },
    age:{
        type:Number
    },
    password:{
        type:String
    },
    role:{
        type:String,
        default:"user"
    }
})

export default mongoose.model('User', userSchema)