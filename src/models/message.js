const mongoose = require("mongoose");

const {String,Number,Boolean,Mixed,ObjectId} = mongoose.Schema.Types;

const messageSchema = new mongoose.Schema({
    user:{
        type:String,
        ref:"User",
        required:true
    },
    chat:{
        type:ObjectId,
        ref:"Chat",
        required:true
    },
    content:{
        type:String,
        required:true
    },
    seen:{type:Number ,default:0}
},{timestamps:true});


const Message = mongoose.model('Message', messageSchema);
module.exports = {Message};