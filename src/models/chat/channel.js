const { default: mongoose } = require("mongoose");

const { String } = mongoose.Schema.Types;

const channelSchema = new mongoose.Schema({
    owner:{type:String,ref:"User",required:true},
    admins:{
      type:[String],
      ref:"User",
    }
  },{_id:false});


module.exports = {channelSchema};