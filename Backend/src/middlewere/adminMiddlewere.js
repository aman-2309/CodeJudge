const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis')


const adminMiddlewere = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error("Token is not present");
        }
        const payload = jwt.verify(token, process.env.JWT_KEY);

        const {id } = payload;
        if (!id) {
            throw new Error("Id not present");
        }
        const result = await User.findById(id);

        const role = payload.role;
        if (role != 'admin') {
            throw new Error('You are not an admin');
        }

        if (!result) {
            throw new Error("Admin doesn't present");
        }

        const isBlocked = await redisClient.exists(`token:${token}`);

        if (isBlocked) {
            throw new Error("Invalid Token");
        }

        req.result = result;
        next();

    } catch (err) {
        res.status(401).send("Error: " + err);
    }
}

module.exports = adminMiddlewere;