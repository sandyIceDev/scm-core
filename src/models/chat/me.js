const mongoose = require("mongoose");

const { String,Number } = mongoose.Schema.Types;


const MeChatSchema = new mongoose.Schema({
    path:{type:String,default:"/"}
},{_id:false});


module.exports = { MeChatSchema };