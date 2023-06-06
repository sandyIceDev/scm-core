const mongoose = require("mongoose");
const crypto = require("crypto");
const { groupSchema } = require("./group");
const { channelSchema } = require("./channel");
const { PvChatSchema } = require("./private");
const { MeChatSchema } = require("./me");

const ChatType ={
  private:0,
  group:1,
  channel:2,
  me:3
}
const { String,Number } = mongoose.Schema.Types;


const chatSchema = new mongoose.Schema({
    peers:{
      type:[String],
      ref:"User",
      required:true,
    },
    private:{type:PvChatSchema,required:false},
    channel:{type:channelSchema,required:false},
    group:{type:groupSchema,required:false},
    me:{type:MeChatSchema,required:false},
    chatType:{type:Number,default:ChatType.private},
    creator:{
      type:String,
      ref:"User",
      required:true
  },
    nonce:{
      type:Number,
      default:crypto.randomInt(1000,9999)
    }
},{timestamps:true});


const Chat = mongoose.model('Chat', chatSchema);
module.exports = {Chat,ChatType};