const mongoose = require("mongoose");

const { String,Mixed } = mongoose.Schema.Types;

const UpdateType = {
    newChat:0,
    chatAccepted:1,
    chatRejected:2,
    newMessage:3
}

const updateSchema = new mongoose.Schema({
    user: {
        type: String,
        required:true
    },
    type:{type:Number,required:true},
    data:{type:Mixed,required:true}
},{timestamps:true});


const Update = mongoose.model('Update', updateSchema);

module.exports = {Update,UpdateType};