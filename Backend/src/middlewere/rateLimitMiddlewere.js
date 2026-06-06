const rateLimit = require('express-rate-limit');

// Limit OTP generation to 3 requests per 10 minutes per IP
const otpRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, 
    message: { message: "Too many OTP requests from this IP, please try again after 10 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limit OTP verification attempts to 10 per 10 minutes per IP to prevent brute-forcing
const otpVerifyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    message: { message: "Too many failed attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limit Code Submission and Run Execution to 5 requests per minute per IP to prevent API exhaustion
const codeExecutionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
    message: { message: "You are submitting code too fast. Please wait a minute." },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    otpRateLimiter,
    otpVerifyLimiter,
    codeExecutionLimiter
};
