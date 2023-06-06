const express = require("express")
const EventEmitter = require("events").EventEmitter;
let {User} = require("../../models/user");
let {Update} = require("../../models/update");

class WebSocketHandler{
    constructor(emitter){
        let peers = {};
        this.emitter = emitter;
        let router = express.Router();

        this.emitter.on("sendUpdateWs",async (updateId)=>{
            let update = await Update.findById(updateId);
            if(update != null){
               if(peers.hasOwnProperty(update.user)){
                   peers[update.user].send(update);
                   await Update.deleteOne({"_id":update._id});
               }
            }
        });

        router.ws("/:uuid",async (ws,req,next)=>{
            let uuid = req.params.uuid;
            if(uuid != undefined){
                let user = await User.findById(uuid);
                if(user != null){
                    console.log("connection from " + uuid);
                    ws.user = user;
                    peers[uuid] = ws;
                    ws.once("close",(code,reason)=>{
                        delete peers[uuid];
                        console.log("connection closed by " + uuid);
                    })
                    await this.checkUpdate(ws);
                }else{
                    ws.close();
                }
            }else{
                ws.close();
            }
        });
        this.router = router;
    }
    async checkUpdate(ws){
        let updates = await Update.find({user:ws.user._id});
        for(let update in updates){
            update["_id"];
            ws.send(update);
            await Update.deleteOne({"_id":update._id});
        }
    }
}


module.exports = {WebSocketHandler};