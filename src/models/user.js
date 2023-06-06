const mongoose = require("mongoose");
const { randomUUID, randomInt,randomBytes } = require('crypto');
const crypto = require('crypto');
const { passwordStrength } = require("check-password-strength");

const role =  {
  master:0,
  admin:1,
  user:2
};

const psk = {
  method:{
    "ksa1":0, // key store alg 1: aes-256-cbc-pkcs7-key[masterkey]-iv:[masterkey-sha256[32]]
  }
};

const { UUID,String,Number,Boolean,Map,ObjectId} = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    _id: {type:String,default:randomUUID()},
    name: String,
    username:{type:String, unique : true},
    email:{
      type:String, 
      unique : true,
      validate: {
        validator: function(v) {
          return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v)
        },
        message: props => `your email address is not valid`
      }
    },
    password:{ // for security reason we just accept hash(sha256) of password
        type:String, 
        validate: {
            validator: function(v) {
              if(this.isModified("password"))
              {
                const regexExp = /^[a-f0-9]{64}$/gi;
                return regexExp.test(v);
              }
            },
            message: props => `your password must be in form of sha256 hex`
          }
        },
    activationCode: {type:Number,required:false},
    role: {type:Number ,default:role.user ,required:true },
    captcha: {
        type: Map,
        of: new mongoose.Schema({
            session:String,
            code:String
        }),
        required:false
    },
    verified:{type:Boolean,default:false},
    credentials:[
      {
        chatId:{type:ObjectId ,ref:"Chat",required:true},
        psk:{type:String,required:true}, // we store pre shared key for each chat in encrypted format (method ksa1)
        method:{type:Number,required:true,default:psk.method.ksa1},
      }
    ],
    publicKey:{type:String,required:true},
    privateKey:{type:String,required:true}
},{timestamps:true});

userSchema.pre('save', function (next) {

    if (!this.isModified('password')) {
      return next();
    }
  
    const hashedPassword = crypto.createHash('sha256') // we accept password just in hash format (then hash it again) at the save time
      .update(this.password)
      .digest('hex');
  
    this.password = hashedPassword;
    next();
});

userSchema.methods.generateCode = function (password) {
  let code = randomInt(10000,99999);
  this.activationCode = code;
  this.save();
  return code;
};

userSchema.methods.checkPassword = function (password) { // we also check hash of password with (doubled hashed) stored password
    const hashedPassword = crypto.createHash('sha256')
      .update(password)
      .digest('hex');
  
    return this.password === hashedPassword;
  };

const User = mongoose.model('User', userSchema);
module.exports = {User,role};