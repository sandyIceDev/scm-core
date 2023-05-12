const Router = require("express").Router;
const {User} = require("../models/user");

let jwt = require("jsonwebtoken");
const uuid = require("uuid");
const { passwordStrength } = require('check-password-strength');
const sendCode = require("../services/mail");
let router = Router();

router.post("/login",async (req,res)=>{
    let result = {ok:false};
    try{
        let {password,uuid,username} = req.body;
        if(uuid === undefined && username === undefined)
            result.error= "username or uuid required";
        else if(password === undefined)
            result.error= "password required";
        else{
            let query = {};
            if(uuid != undefined)
                query._id = uuid;
            else
                query.username = username;
            let user = await User.findOne(query);
            if(user != null){
                if(user.verified){
                    if(user.checkPassword(password)){
                        const jwt_secret = process.env.JWT_SECRET || "3ecR3t";
                        result.token =  jwt.sign({uuid:user._id.toString(),username:user.username,role:user.role},jwt_secret);
                        result.ok=true;
                    }else
                        result.error = "invalid username or password";
                }else
                    result.error = "please verify your email first";
            }else
                result.error = "invalid identifer or password";
        }
    }catch(e){
        if(e.message.includes("Cast to UUID failed"))
            result.error = "invalid uuid";
        else
            result.error = "server error";
    }
    res.json(result).end();
});

router.post("/signup",async (req,res)=>{
    let {name,username,password,email} = req.body;
    let result = { ok:false};
    if(name === undefined)
        result.error = "name is required";
    else if(username === undefined)
        result.error = "username is required";
    else if(password === undefined)
        result.error = "password is required";
    else if(email === undefined)
        result.error= "email is required";
    else{
        let user = await User.findOne({username});
        if(user == null){
            try{   
                user = await User.create({_id:uuid.v4(),username,password,email,name});
                try{
                    await sendCode(user.email,user.generateCode());
                    result.message = "please verify your email address";
                }catch(e){
                    console.log("fail to send activation code");
                    result.message = "fail to send activation code";
                }
                result.ok=true;
                result.uuid = user._id.toString();
            }catch(e){
                result.error = e.message;
            }
        }else
            result.error = "username already exist";
    }
    res.json(result).end();
});

router.post("/resend/code",async (req,res)=>{
    let { uuid } = req.body;
    let result = { ok:false };
    if(uuid === undefined)
        result.error= "uuid is required";
    else{
        try{   
            let user = await User.findById(uuid);
            if(user != null){
                try{
                    await sendCode(user.email,user.generateCode());
                }catch(e){
                    console.error(e);
                    result.error = "fail to send activation code";
                    result.ok = false;
                }
            }else
                result.error = "invalid uuid";
        }catch(e){
            result.error = e.message;
        }
    }
    res.json(result).end();
});

router.post("/verify",async (req,res)=>{
    let {uuid,code} = req.body;
    let result = { ok:false };
    if(uuid === undefined)
        result.error = "uuid is required";
    else if(code ===undefined)
        result.error = "code is required";
    else{
        try{
            let user = await User.findOne({_id:uuid});
            if(user != null){
                if(user.verified)
                {
                    result.ok = false;
                    result.error = "your email address already verified";
                }
                else if(user.activationCode.toString() === code){
                    user.verified = true;
                    await user.save();
                    result.ok = true;
                    result.message = "your email address verified";
                }else
                    result.error = "invalid activation code";
            }else // must adding request count check to return captcha;
                result.error = "invalid uuid";
        }catch(e){
            if(e.message.includes("Cast to UUID failed"))
                result.error = "invalid uuid";
            else
                result.error = "server error";
        }
    }
    res.json(result).end();
});

function access(role){
    return function auth(req,res,next){
      if(req.headers.hasOwnProperty("jwt-access-token")){
        try{
            let token = req.headers["jwt-access-token"];
            const jwt_secret = process.env.JWT_SECRET || "3ecR3t";
            let payload = jwt.verify(token,jwt_secret);
            if(payload != null){
                req.user = payload;
                if(payload.role === role || role === undefined){
                    next();
                }
                else
                    res.json({ok:false,error:"access denied"}).status(403).end();
            }
            else
                res.json({ok:false,error:"invalid jwt-access-token header"}).status(401).end();
        }catch(e){
            res.json({ok:false,error:"malform jwt-access-token header"}).status(401).end();
        }
      }else
        res.json({ok:false,error:"jwt-access-token header not found"}).status(401).end();
    };
}
module.exports = {
    access,
    auth:router
};