const mongoose = require("mongoose");

const chatType ={
  private:0,
  group:1,
  channel:2
}
const { UUID,String,Number,Boolean,Map} = mongoose.Schema.Types;
const chatSchema = new mongoose.Schema({
    peers:{
      type:[UUID],
      required:true
    },
    chatType:{type:Number,default:chatType.private},
    owner:{type:UUID,required:false},
    admins:{
      type:[UUID],
      required:false,
    }
},{timestamps:true});


const Chat = mongoose.model('Chat', chatSchema);
module.exports = {Chat,chatType};