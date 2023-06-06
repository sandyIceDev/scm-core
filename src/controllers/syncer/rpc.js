var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var {Update} = require("../../models/update");
const WebSocketHandler = require('./websocket');

class GrpcSyncer {
    constructor (emitter,{appId,mainSyncServer,listenRpcAddress}){
        this.emitter = emitter;
        this.syncOption = {appId,mainSyncServer,listenRpcAddress};
        var packageDefinition = protoLoader.loadSync("/home/star/workspace/scm/scm-syncer/syncer.proto");
        let syncerProto = grpc.loadPackageDefinition(packageDefinition).ScmSyncer;
        this.client = new syncerProto.SyncServer(this.syncOption.mainSyncServer,grpc.credentials.createInsecure());
        this.server = new grpc.Server();
        this.server.addService(syncerProto.SyncClient.service, {SendUpdate:this.SendUpdate});
        this.handleUpdate();
        this.client.TogglePeer({rpcConnection:this.syncOption.listenRpcAddress,appId:this.syncOption.appId},function(error, response) {
            if(error || !response.ok){
                console.log("fail to connect rpc SyncServer");
            }else{
                console.log("connected to rpc SyncServer");
            }
        });
    }
    SendUpdate(call,callback){
        const updateId = call.request.updateId;
        this.emitter.emit("sendUpdateWs",updateId);
        callback(null,{ok:true});
    }
    handleUpdate(){
        this.emitter.on("sendUpdateRpc",async (updateId)=>{
            let update = await Update.findById(updateId);
            this.client.SendUpdate({updateId,clientId:update.user},(err,res)=>{
                if(response.ok){
                    console.log("update transported to sync server");
                }
            })
        });
    }
    bindRpc(){   
        this.server.bindAsync(this.syncOption.listenRpcAddress, grpc.ServerCredentials.createInsecure(), () => {
            this.server.start();
            console.log(`rpc server start at ${this.syncOption.listenRpcAddress}`)
        });
    }
}

module.exports = {
    GrpcSyncer
}