const {Router} =  require("express")
let svgCaptcha = require("svg-captcha");
let admin = require("./admin/routes");
let chat = require("./chat");
let user = require("./user");
let {auth,access} = require("./auth");
const { role } = require("../models/user");


let router = Router();

router.use("/admin",access(role.admin),admin);
router.use("/user",access(),user);
router.use("/chat",access(),chat);
router.use("/auth",auth);

module.exports = router;