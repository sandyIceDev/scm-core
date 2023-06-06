
const app = require("./index");
const Syncer = require("./controllers/syncer");
const { initdb } = require("./services/worker");
let PORT = process.env.PORT || 5000;
let HOST = process.env.HOST || "127.0.0.1";

app.listen(PORT,HOST,()=>{
    console.log(`listening on ${HOST}:${PORT} ...`);
    initdb().catch(err => console.log(err));
});