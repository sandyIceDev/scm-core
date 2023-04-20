const mongoose = require("mongoose");
const { randomUUID, randomInt,randomBytes } = require('crypto');

const { UUID,String,Number} = mongoose.Schema.Types;
const userSchema = new mongoose.Schema({
    _id: {type:UUID,default:randomUUID()},
    name: String,
    username:String,
    email:String,
    password:String,
    otp: {type:Number,default:randomInt(10000,99999)}
},{timestamps:true});

const User = mongoose.model('User', userSchema);
module.exports = User;