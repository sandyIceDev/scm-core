const Router = require("express").Router;
const { Chat } = require("../models/chat/chat");
const {Message} = require("../models/message");
const { UpdateType } = require("../models/update");
let Syncer = require("./syncer");
let router = Router();

router.post("/list",async (req,res)=>{
    let chatid = req.body.chatid;
    let message_list = await Message.find({chat:chatid}).populate("user","-_id name username").exec();
    return res.json(message_list).end();
});

router.post("/send",async (req,res,next)=>{
    if(!req.body.hasOwnProperty("chatid"))
        return next({message:"chatid required",code:400});
    else if(!req.body.hasOwnProperty("content"))
        return next({message:"content required",code:400});
    else if(!req.body.hasOwnProperty("signature"))
        return next({message:"signature required",code:400});
    let chat = await Chat.findOne({_id:req.body.chatid});
    if(chat!=null && chat.peers.includes(req.user.uuid)){
        let message = await Message.create({chat:req.body.chatid,user:req.user.uuid,content:req.body.content,signature:req.body.signature});
        message.save();

        for(let i in chat.peers){
            new Syncer().getInstance().emitter.emit("sendUpdate",{updateType:UpdateType.newMessage,uuid:chat.peers[i],data:{
                ...message.toJSON(),
                user:req.user.username
            }});
        }
        res.json({ok:true}).end();
    }else{
        return next({message:"join the chat first!",error:403});
    }
        
});

module.exports = router;