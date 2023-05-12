const Router = require("express").Router;
const user = require("./user");
let router = Router();
router.use("/user",user);
module.exports = router;