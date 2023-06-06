const { EventEmitter } = require("events");
const { WebSocketHandler } = require("./websocket");
const { GrpcSyncer } = require("./rpc");
const { Update } = require("../../models/update");

class UpdateHandler{
    constructor(){
        let useRpcSyncer = process.env.Rpc == "1" ? true:false;
        this.emitter = new EventEmitter();
        this.wsHandler = new WebSocketHandler(this.emitter);
        if(useRpcSyncer){
            let appId = process.env.AppId;
            let mainSyncServer = process.env.RpcMainServer;
            let listenRpcAddress = process.env.RpcListenAddress;
            if(appId === undefined || mainSyncServer === undefined || listenRpcAddress === undefined){
                process.stderr.write("AppId & RpcMainServer & RpcListenAddress required in Rpc enabled mode");
                process.exit(-1);
            }
            this.rpcHandler = new GrpcSyncer(this.emitter,{appId,mainSyncServer,listenRpcAddress});
            this.rpcHandler.bindRpc();
        }
        this.emitter.on("sendUpdate",async ({updateType,uuid,data})=>{
            let update = await Update.create({
                user:uuid,
                type:updateType,
                data
            });
            if(this.wsHandler.peers.hasOwnProperty(uuid)){
                this.emitter.emit("sendUpdateWs",update._id.toString());
            }else if(this.hasOwnProperty("rpcHandler")){
                this.emitter.emit("sendUpateRpc",update._id.toString());
            }
        });
    }
}
class Singelton{
    constructor(){
        if(!Singelton.instance){
            Singelton.instance = new UpdateHandler();
        }
    }
    getInstance(){
        return Singelton.instance;
    }
    emitter(){
        return Singelton.instance.emitter;
    }
}



module.exports = Singelton;