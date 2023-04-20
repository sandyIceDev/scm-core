let express = require("express");
let ews = require('express-ws');
const { initdb } = require("./services/worker");
const api = require("./controllers/");
const { default: createCaptcha } = require("./services/captcha");

require('dotenv').config()
let PORT = process.env.PORT || 5000;
let HOST = process.env.HOST || "127.0.0.1";
let app = express();
var wsapp = ews(app);

app.use(express.json());
app.use("/static",express.static('public'));
app.use("/api",api);
createCaptcha("test","12");
app.listen(PORT,HOST,()=>{
    console.log(`listening on ${HOST}:${PORT} ...`);
    initdb().catch(err => console.log(err));
});