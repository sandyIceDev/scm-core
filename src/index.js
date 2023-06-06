let express = require("express");
let ews = require('express-ws');
let denv = require('dotenv');
denv.config()

let app = express();
var wsapp = ews(app);


const api = require("./controllers/");


app.use(express.json());
app.use("/api",api);

app.use((error,req,res,next)=>{
    if(error.hasOwnProperty("code"))
        res.status(error.code)
    else
        res.status(500)
    if(error.message.includes("JSON"))
        res.json({ok:false,error:"invalud json"})
    else
        res.json({ok:false,error:error.message})
    
})

module.exports = app;