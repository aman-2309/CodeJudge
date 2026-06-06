const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    emailId: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // TTL: 10 min
});

module.exports = mongoose.model("Otp", otpSchema);