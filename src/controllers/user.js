const { User, role } = require("../models/user");

const Router = require("express").Router;
let router = Router();

router.get("/me", async (req,res,next)=>{
    let {uuid} = req.user;
    let user = await User.findById(uuid);
    if(user == null)
        return next({message:"invalid uuid",code:403});
    data = {
        username:user.username,
        uuid,
        private:user.privateKey,
        name:user.name,
        email:user.email,
    }
    if(user.role < role.user )
        data.role = user.role;
    res.json({ok:true,data}).end();
});

router.get("/credentials", async (req,res,next)=>{
    let {uuid} = req.user;
    let user = await User.findById(uuid);
    if(user == null)
        return next({message:"invalid uuid",code:403});
    data = {
        credentials:user.credentials,
        privateKey:user.privateKey  
    }
    res.json({ok:true,data}).end();
});

module.exports = router;