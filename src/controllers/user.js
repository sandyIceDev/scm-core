const { User, role } = require("../models/user");

const Router = require("express").Router;
let router = Router();

router.get("/me", async (req,res)=>{
    let { uuid }= req.user;
    let user = await User.findById(uuid);
    data = {
        username:user.username,
        uuid:uuid,
        name:user.name,
        email:user.email,
        credentials:user.credentials
    }
    if(user.role < role.user )
        data.role = user.role;
    res.json({ok:true,data}).end();
});

module.exports = router;