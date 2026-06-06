const { createClient }  = require('redis')

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-17307.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 17307
    }
});

module.exports = redisClient;

