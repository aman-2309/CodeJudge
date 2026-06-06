// const { response } = require('express');
const User = require('../models/user')
const Submission = require('../models/submission')
const validate = require('../utils/validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const crypto = require("crypto");
const Otp = require("../models/otp");
const sendOtpEmail = require("../utils/sendOtp");
require('dotenv').config();

const CLIENT_URL = process.env.CLIENT_URL;

const cookieOptions = {
    maxAge: 3600000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
};

const clearCookieOptions = {
    expires: new Date(Date.now()),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
};

const buildAuthReply = (user) => ({
    firstName: user.firstName,
    lastName: user.lastName || '',
    email: user.emailId,
    id: user.id,
    role: user.role,
});

const generateUniqueUserName = async (seed) => {
    const sanitizedSeed = (seed || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '');
    let candidate = sanitizedSeed || 'user';

    let suffix = 0;
    while (await User.exists({ userName: candidate })) {
        suffix += 1;
        candidate = `${sanitizedSeed || 'user'}${suffix}`;
    }

    return candidate;
};


const register = async (req, res) => {
    try {
        validate(req.body);
        const { emailId, password } = req.body;
        req.body.role = 'user';
        req.body.userName = await generateUniqueUserName(req.body.userName || emailId.split('@')[0]);

        req.body.password = await bcrypt.hash(password, 10);
        await User.create(req.body);
        const user = await User.findOne({ emailId });


        const token = jwt.sign({ id: user._id, emailId, role: 'user' }, process.env.JWT_KEY, { expiresIn: 3600 });

        res.cookie('token', token, cookieOptions);

        const reply = buildAuthReply(user);
        res.status(200).json({
            user: reply,
            message: "Registered Successfully",
        });
    } catch (err) {
        res.status(400).json({ message: err.message || 'Registration failed' });
    }
}

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId) {
            throw new Error("Invalid Credentials");
        }
        if (!password) {
            throw new Error("Invalid Credentials");
        }
        const user = await User.findOne({ emailId });
        if (!user) throw new Error("Invalid Credentials");

        if (!user.password) {
            throw new Error("This account uses Google login. Please continue with Google.");
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new Error("Invalid Credentials");

        const token = jwt.sign({ id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 3600 });
        res.cookie('token', token, cookieOptions);

        const reply = buildAuthReply(user);
        res.status(201).json({
            user: reply,
            message: "Login Successfully",
        });


    } catch (err) {
        res.status(401).json({ message: err.message || 'Login failed' });
    }
}

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`, 'blocked');

        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie('token', null, clearCookieOptions);
        res.status(200).send("Logged out Successfully");
    } catch (err) {
        res.status(503).json({ message: err.message || 'Logout failed' });
    }
}

const adminRegister = async (req, res) => {
    try {
        validate(req.body);
        const { emailId, password } = req.body;

        req.body.userName = await generateUniqueUserName(req.body.userName || emailId.split('@')[0]);
        req.body.password = await bcrypt.hash(password, 10);
        await User.create(req.body);
        const user = await User.findOne({ emailId });

        const token = jwt.sign({ id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 3600 });
        res.cookie('token', token, cookieOptions);

        res.status(201).send("Admin Registered Successfully");
    } catch (err) {
        res.status(400).json({ message: err.message || 'Admin registration failed' });
    }
}

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result.id;

        await User.findByIdAndDelete(userId);

        // await Submission.deleteMany({userId});

        res.status(200).send('profile deleted successfully');
    } catch (err) {
        res.status(400).send("Error: " + err);
    }
}

const checkProfile = (req, res) => {
    const user = req.result;
    const reply = buildAuthReply(user);

    res.status(201).json({
        user: reply,
        message: "valid user",
    });
}

const getProfile = async (req, res) => {
    try {
        const userId = req.result.id;
        const user = await User.findById(userId)
            .select('firstName lastName emailId userName role problemSolved')
            .populate({ path: 'problemSolved', select: 'difficulty' });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const solvedByDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
        user.problemSolved.forEach((p) => {
            if (solvedByDifficulty[p.difficulty] !== undefined) {
                solvedByDifficulty[p.difficulty]++;
            }
        });

        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName || '',
            email: user.emailId,
            userName: user.userName,
            role: user.role,
            totalSolved: user.problemSolved.length,
            solvedByDifficulty,
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile: ' + err.message });
    }
}

const googleAuthSuccess = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
        }

        const token = jwt.sign(
            { id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: 3600 },
        );

        res.cookie('token', token, cookieOptions);
        return res.redirect(CLIENT_URL);
    } catch (err) {
        return res.redirect(`${CLIENT_URL}/login?error=google_auth_failed`);
    }
}

const sendOtp = async (req, res) => {
    const { emailId, name, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ emailId: emailId });
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Save/replace OTP in DB
        await Otp.findOneAndDelete({ emailId }); // Remove old OTP if any
        await Otp.create({ emailId, otp });

        // Send OTP email
        await sendOtpEmail(emailId, otp);

        res.status(200).json({ message: "OTP sent to email" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

const verifyOtp = async (req, res) => {
    const { emailId, otp, name, password } = req.body;

    try {
        const otpRecord = await Otp.findOne({ emailId });

        if (!otpRecord) return res.status(400).json({ message: "OTP expired or not found" });
        if (otpRecord.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });


        // OTP is valid — create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const userName = await generateUniqueUserName(emailId.split('@')[0]);



        const user = await User.create({
            firstName: name,
            emailId: emailId,
            userName: userName,
            password: hashedPassword,
            role: 'user'
        });


        const token = jwt.sign({ id: user._id, emailId: emailId, role: 'user' }, process.env.JWT_KEY, { expiresIn: 3600 });
        res.cookie('token', token, cookieOptions);

        const reply = buildAuthReply(user);

        // Clean up OTP
        await Otp.findOneAndDelete({ emailId });

        res.status(201).json({ message: "Registration successful", user: reply });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

module.exports = {
    register,
    login,
    logout,
    adminRegister,
    deleteProfile,
    checkProfile,
    getProfile,
    googleAuthSuccess,
    sendOtp,
    verifyOtp
}