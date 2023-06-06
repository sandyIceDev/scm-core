const { User } = require("../models/user");
const { Chat, chatType } = require("../models/chat/chat");
const { Update, UpdateType } = require("../models/update");
const { PvChatStatus } = require("../models/chat/private");
const {ChatInteraction} = require("../models/chat/interaction");
const Router = require("express").Router;
let Syncer = require("./syncer");
let router = Router();

router.get("/list",async (req,res)=>{
    let chats = await Chat.find({peers:{"$elemMatch":{"$eq":req.user.uuid}}}).populate("peers","-_id name username publicKey").exec();
    res.json({ok:true,chats}).end();
});

router.post("/request",async (req,res,next)=>{
    let peer = await User.findOne({username:req.body.identifer}); // currently we just implement username as identifer
    if(peer != null){
        if(peer._id.toString() === req.user.uuid)
        {

            let check = await Chat.findOne({peers:[req.user.uuid],chatType:chatType.me});
            if(check == null){
                let chat = await Chat.create({peers:[peer._id],chatType:chatType.me});
                res.json({"ok":true,"message":"save message created"}).end();
            }else{
                return next({message:"save message already exist",code:400});
            }
        }else{
            let check = await Chat.findOne({peers:[peer._id,req.user.uuid]});
            if(check == null){
                let chat = await Chat.create({peers:[peer._id,req.user.uuid],private:{creator:req.user._id,status:PvChatStatus.pending}});
                await ChatInteraction.create({user:peer._id,chat:chat._id});
                await ChatInteraction.create({user:req.user.uuid,chat:chat._id});
                new Syncer().emitter().emit("update",{
                    udpateType:UpdateType.newChat,
                    uuid:peer._id,
                    data:{
                        chatId:chat._id.toString(),
                        nonce:chat.nonce,
                        user:req.user.username,
                        publicKey:req.user.publicKey
                    }
                });
                res.json({"ok":true,"message":"wait for your contact to approve your request"}).end();
            }else{
                return next({message:"this chat was requested already",code:400});
            }
        }
    }else{
        return next({message:"no matching username or chat-id",code:400});
    }

});

module.exports = router;