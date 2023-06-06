const mongoose = require("mongoose");


const {String,Number,Boolean,Date,ObjectId} = mongoose.Schema.Types;

const InteractionSchema = new mongoose.Schema({
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
    unseen:{
        type:Number,
        default:0
    },
    lastseen:{
        type:Date,
        required:false    
    },
    mute:{
        type:Boolean,
        default:false
    },mention:{
        type:[ObjectId],
        ref:"Message"
    }
},{timestamps:true});


const ChatInteraction = mongoose.model('Interaction', InteractionSchema);
module.exports ={ChatInteraction};