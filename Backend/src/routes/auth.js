const express = require("express");
const otprouter = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user");
const Otp = require("../models/otp");
const sendOtpEmail = require("../utils/sendOtp");

// Step 1: Send OTP
router.post("/send-otp", async (req, res) => {
    const { email, name, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Save/replace OTP in DB
        await Otp.findOneAndDelete({ email }); // Remove old OTP if any
        await Otp.create({ email, otp });

        // Send OTP email
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: "OTP sent to email" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Step 2: Verify OTP & Complete Registration
router.post("/verify-otp", async (req, res) => {
    const { email, otp, name, password } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord) return res.status(400).json({ message: "OTP expired or not found" });
        if (otpRecord.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

        // OTP is valid — create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        // Clean up OTP
        await Otp.findOneAndDelete({ email });

        res.status(201).json({ message: "Registration successful", userId: user._id });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;