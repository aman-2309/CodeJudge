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

let redisClient;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
} else {
    console.warn("WARNING: Upstash Redis environment variables are missing. Redis client is undefined.");
    // Provide a dummy client to prevent crashes if it gets called
    redisClient = {
        get: async () => null,
        set: async () => null,
        expireAt: async () => null,
        del: async () => null,
    };
}

module.exports = redisClient;

