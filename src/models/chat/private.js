const mongoose = require("mongoose");

const { String,Number } = mongoose.Schema.Types;
const PvChatStatus = {
    pending:0,
    accepted:1,
    rejected:2
}

const PvChatSchema = new mongoose.Schema({
    status:{type:Number,default:PvChatStatus.pending}
},{_id:false});


module.exports = { PvChatSchema,PvChatStatus };