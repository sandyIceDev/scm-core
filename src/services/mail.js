const {randomInt} = require("crypto");
const nodemailer = require("nodemailer");
async function sendCode(target,code = randomInt(10000,99999)){
    let account = {};
    if(process.env.SMTP_USERNAME != null && process.env.SMTP_PASSWORD != null){
        account.user = process.env.SMTP_USERNAME;
    }else{
        account = await nodemailer.createTestAccount();
        console.log(account);
    }
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: process.env.SMTP_PORT || 587,
        secure:false,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
    let info = await transporter.sendMail({
        from: `"scm-core ⭐" <${account.user}>`,
        to: target,
        subject: "scm-core",
        html: `your activation code is <h1>${code}</h1>`
    });
    return code;
}
module.exports = sendCode;