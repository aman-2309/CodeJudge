const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis')


const userMiddlewere = async(req,res,next)=>{
    try{
        
        const {token} = req.cookies;
        if(!token){
            throw new Error("Token is not present");
        }
        const payload = jwt.verify(token,process.env.JWT_KEY);

        const {id} = payload;
        if(!id){
            throw new Error("Id of user is not present");
        }
        const result = await User.findById(id);

        if(!result){
            throw new Error("User doesn't present");
        }

        const isBlocked = await redisClient.exists(`token:${token}`);
        if(isBlocked){
            throw new Error("Invalid Token");
        }
        req.result = result;
        next();

    }catch(err){
        res.status(401).send("Error: "+err);
    }
}

module.exports = userMiddlewere;