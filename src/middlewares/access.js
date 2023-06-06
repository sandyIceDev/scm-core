const jwt = require("jsonwebtoken")
function access(role){
    return function auth(req,res,next){
      if(req.headers.hasOwnProperty("jwt-access-token")){
        try{
            let token = req.headers["jwt-access-token"];
            const jwt_secret = process.env.JWT_SECRET || "3ecR3t";
            let payload = jwt.verify(token,jwt_secret);
            if(payload != null){
                req.user = payload;
                if(payload.role === role || role === undefined){
                    next();
                }
                else
                    res.json({ok:false,error:"access denied"}).status(403).end();
            }
            else
                res.json({ok:false,error:"invalid jwt-access-token header"}).status(401).end();
        }catch(e){
            res.json({ok:false,error:"malform jwt-access-token header"}).status(401).end();
        }
      }else
        res.json({ok:false,error:"jwt-access-token header not found"}).status(401).end();
    };
}
module.exports = access;