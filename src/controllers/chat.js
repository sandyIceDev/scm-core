const { User } = require("../models/user");
const { Chat, ChatType } = require("../models/chat/chat");
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
    if(!req.body.hasOwnProperty("identifer"))
        return next({message:"identifer required",code:400}); 
    let peer = await User.findOne({username:req.body.identifer}); // currently we just implement username as identifer
    if(peer != null){
        if(peer._id.toString() === req.user.uuid)
        {

            let check = await Chat.findOne({peers:[req.user.uuid],chatType:ChatType.me});
            if(check == null){
                let chat = await Chat.create({peers:[peer._id],chatType:ChatType.me,creator:req.user.uuid});
                res.json({"ok":true,"message":"save message created",chat:chat.toJSON()}).end();
            }else{
                return next({message:"save message already exist",code:400});
            }
        }else{
            let check = await Chat.findOne({peers:[peer._id,req.user.uuid]});
            if(check == null){
                let chat = await Chat.create({peers:[peer._id,req.user.uuid],creator:req.user.uuid,private:{creator:req.user._id,status:PvChatStatus.pending}});
                await ChatInteraction.create({user:peer._id,chat:chat._id});
                await ChatInteraction.create({user:req.user.uuid,chat:chat._id});
                await chat.populate("peers","-_id name username publicKey");
                new Syncer().emitter().emit("sendUpdate",{
                    updateType:UpdateType.newChat,
                    uuid:peer._id,
                    data:{
                        chat:chat.toJSON()
                    }
                });
                res.json({"ok":true,"message":"wait for your contact to approve your request",chat:chat.toJSON()}).end();
            }else{
                return next({message:"this chat was requested already",code:400});
            }
        }
    }else{
        return next({message:"no matching username or chat-id",code:400});
    }

});

router.post("/feedback",async (req,res,next)=>{
    if(!req.body.hasOwnProperty("chatId"))
        return next({message:"chatId required",code:400});
    if(!req.body.hasOwnProperty("accept"))
        return next({message:"accept required",code:400});
    let {chatId,accept} = req.body;
    let chat = await Chat.findById(chatId);
    if(chat != null){
        switch(chat.chatType){
            case ChatType.private:
                if (req.user.uuid !== chat.creator && chat.peers.includes(req.user.uuid)){
                    chat.private.status = accept ? PvChatStatus.accepted : PvChatStatus.rejected;
                    chat.save();
                    new Syncer().emitter().emit("sendUpdate",{
                        updateType:accept ? UpdateType.chatAccepted: UpdateType.chatRejected,
                        uuid:chat.creator,
                        data:{
                            chatId:chat._id.toString()
                        }
                    });
                    res.json({ok:true}).end();
                }else{
                    return next({message:"you cant accept or reject this chat",code:403});
                }
                break;
            default:
                return next({message:"this chat is not a private",code:400});
        }
    }else{
        return next({message:"no matching chat-id",code:400});
    }

});

module.exports = router;