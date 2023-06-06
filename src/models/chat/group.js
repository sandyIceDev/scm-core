const { default: mongoose } = require("mongoose");

const { String,Number } = mongoose.Schema.Types;

const groupSchema = new mongoose.Schema({
    owner:{type:String,ref:"User",required:true},
    admins:{
      type:[String],
      ref:"User",
    }
  },{_id:false});

module.exports = {groupSchema};