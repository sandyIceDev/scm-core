const {Router} =  require("express")
let svgCaptcha = require("svg-captcha");
let admin = require("./admin/routes");
let chat = require("./chat");
let user = require("./user");
let auth = require("./auth");
const message = require("./message");
let access = require("../middlewares/access");
const Syncer = require("./syncer");
const { role } = require("../models/user");

let syncer = new Syncer().getInstance();

let router = Router();

router.use("/admin",access(role.admin),admin);
router.use("/user",access(),user);
router.use("/chat",access(),chat);
router.use("/message",access(),message); // file handler
router.use("/auth",auth);
router.use("/ws",syncer.wsHandler.router);

module.exports = router;