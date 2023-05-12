let {User,role} = require("../models/user");
const { initdb } = require("./worker");
let denv = require('dotenv')

async function seed(){
    denv.config()
    await initdb();
    let udata = {
        name : process.env.SEED_NAME || "master",
        username : process.env.SEED_USERNAME || "master",
        password : process.env.SEED_PASSWORD || "Master@12345",
        email : process.env.SEED_EMAIL || "master@gmail.com",
        role:role.master,
        verified:true
    };
    let user = await User.findOne(udata);
    if(user == null){
        user = await User.create(udata);
        user.save();
    }
} 

seed().then(()=>{
    console.log("database seeded");
    process.exit(0);
})