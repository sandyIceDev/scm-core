let user = require("./admin/user")
const {Router} =  require("express")

let router = Router();
router.get("/",(req,res)=>{
    res.json({"ok":false}).end();
})
router.use("/user",user);

module.exports = router;