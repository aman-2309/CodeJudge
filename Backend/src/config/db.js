// const mongoose = require('mongoose');
// require('dotenv').config();

// async function main() {
//     await mongoose.connect(process.env.DB_CONNECT_STRING);
// }

// module.exports = main;





const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

async function connectDB() {
    if (isConnected) {
        console.log("Using cached DB connection");
        return;
    }

    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        isConnected = true;
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        throw err;
    }
}

module.exports = connectDB;