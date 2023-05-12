const Router = require("express").Router;
const {User} = require(`../../models/user`);
let router = Router();

router.post("/add",async (req,res)=>{
    let udata = req.body;
    let user = await User.create(udata)
    console.log(user._id);
    res.json({ok:true});
});

router.put("/update",(req,res)=> {
    let {query,data} = req.body;
});

router.delete("/del",(req,res)=> {
    
});

router.get("/",(req,res)=>{
    
});

module.exports = router;