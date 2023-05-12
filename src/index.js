let express = require("express");
let ews = require('express-ws');
const { initdb } = require("./services/worker");
const api = require("./controllers/");
let denv = require('dotenv')

denv.config()
let PORT = process.env.PORT || 5000;
let HOST = process.env.HOST || "127.0.0.1";

let app = express();
var wsapp = ews(app);

app.use(express.json());
app.use("/api",api);

app.use((error,req,res,next)=>{
    if(error.message.includes("JSON"))
        res.json({ok:false,error:"invalud json"})
    else
        res.json({ok:false,error:error.message})
    res.end();
})

app.listen(PORT,HOST,()=>{
    console.log(`listening on ${HOST}:${PORT} ...`);
    initdb().catch(err => console.log(err));
});