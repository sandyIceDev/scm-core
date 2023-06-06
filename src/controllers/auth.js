const Router = require("express").Router;
const {User} = require("../models/user");

let jwt = require("jsonwebtoken");
const uuid = require("uuid");
const { passwordStrength } = require('check-password-strength');
const sendCode = require("../services/mail");
let router = Router();

router.post("/login",async (req,res,next)=>{
    let result = {ok:false};
    try{
        let {password,username} = req.body;
        if(username === undefined)
            return next({message: "username required",code:200});
        else if(password === undefined)
            return next({message: "password required",code:200});
        else{
            let query = { username };
            let user = await User.findOne(query);
            if(user != null){
                if(user.checkPassword(password)){
                    if(user.verified){
                        const jwt_secret = process.env.JWT_SECRET || "3ecR3t";
                        let payload = {
                            uuid:user._id.toString(),
                            username:user.username,
                            role:user.role,
                            publicKey:user.publicKey
                        };
                        result.token =  jwt.sign(payload,jwt_secret);
                        result.ok=true;
                    }else    
                        return next({message: "please verify your email first",code:200});
                }else
                    return next({message:"invalid username or password",code:400});
            }else
                return next({message:"invalid username or password",code:400});
        }
    }catch(e){
        return next({message:"server error",code:500});
    }
    res.json(result).end();
});

router.post("/signup",async (req,res,next)=>{
    let {name,username,password,email,publicKey,privateKey} = req.body;
    let result = { ok:false };
    if(name === undefined || username === undefined || password === undefined || 
        email === undefined || publicKey === undefined || privateKey === undefined)
        returnnext({message:"invalid request data",code:400});
    else{
        let user = await User.findOne({username});
        if(user == null){
            try{
                user = await User.create({_id:uuid.v4(),username,password,email,name,publicKey,privateKey});
                try{
                    // await sendCode(user.email,user.generateCode());
                    console.log(user.email,user.generateCode());
                    result.message = "please verify your email address";
                }catch(e){
                    console.log(e);
                    returnnext({message:"fail to send activation code",code:503});
                }
                result.ok=true;
                result.uuid = user._id.toString();
            }catch(e){
                if(e.message.includes("User validation failed"))
                    returnnext({message:e.message,code:400});
                else 
                    returnnext(e);
            }
        }else
            returnnext({message:"username already exist",code:409});
    }
    res.json(result).end();
    
});

router.post("/resend/code",async (req,res,next)=>{
    let { uuid } = req.body;
    let result = { ok:false };
    if(uuid === undefined)
        returnnext({message:"uuid required",code:400});
    else{
        try{   
            let user = await User.findById(uuid);
            if(user != null){
                try{
                    await sendCode(user.email,user.generateCode());
                    result.ok = true;
                }catch(e){
                    console.error(e);
                    returnnext({message:"fail to send activation code",code:503});
                }
            }else
                returnnext({message:"invalid uuid",code:400});
        }catch(e){
            result.error = e.message;
        }
    }
    res.json(result).end();
});

router.post("/verify",async (req,res,next)=>{
    let {uuid,code} = req.body;
    let result = { ok:false };
    if(uuid === undefined)
    returnnext({message:"uuid required",code:400});
    else if(code ===undefined)
    returnnext({message:"code required",code:400});
    else{
        try{
            let user = await User.findOne({_id:uuid});
            if(user != null){
                if(user.verified)
                {
                    returnnext({message:"your email address already verified",code:400});
                }
                else if(user.activationCode.toString() === code){
                    user.verified = true;
                    await user.save();
                    result.ok = true;
                    result.message = "your email address verified";
                }else
                    returnnext({message:"invalid activation code",code:400});
            }else // must adding request count check to return captcha;
                returnnext({message:"invalid uuid",code:400});
        }catch(e){
            result.error = "server error";
        }
    }
    res.json(result).end();
});


module.exports = router;