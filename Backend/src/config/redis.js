// const { createClient } = require('redis')

// const redisClient = createClient({
//     username: 'default',
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: 'redis-17307.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
//         port: 17307
//     }
// });

const { Redis } = require("@upstash/redis");

const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = redisClient;

