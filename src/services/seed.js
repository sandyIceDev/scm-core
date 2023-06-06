let {User,role} = require("../models/user");
const { initdb } = require("./worker");
let denv = require('dotenv')

async function seed(){
    denv.config()
    await initdb();
    let udata = {
        name : process.env.SEED_NAME || "master",
        username : process.env.SEED_USERNAME || "master",
        password : process.env.SEED_PASSWORD || "0e9ea3999356faea48c449864e898c51a0ac75c7dfcb1eaba64e90558022b5b9", // Master@12345 -> masterkey = sha256(username+":"+password)
        email : process.env.SEED_EMAIL || "master@gmail.com",
        publicKey:"63e7c65ebee59df4c86deb3cd466bde2cb5efa952196221d55e072a93c279b74", // eliptic curve25519 random public & private
        privateKey:"cdgTdevsIvYtLMxPcXOi5cnBQXDE+pD6O7M/HDuHoPWMdNe6oT0uWTD4Ud3+SQrxCGrDiboLAWRv1sj5SwnAhw==", //prvatekey encrypted with masterkry by aes-256-cbc 
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