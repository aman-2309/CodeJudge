const express = require('express');
const passport = require('passport');
const { register, login, logout, adminRegister, deleteProfile, checkProfile, getProfile, googleAuthSuccess, sendOtp, verifyOtp } = require('../controlers/userAuthentication')
const authRouter = express.Router();
const userMiddlewere = require('../middlewere/userMiddlewere')
const adminMiddlewere = require('../middlewere/adminMiddlewere')




authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddlewere, logout);
// authRouter.get('getprofile',getprofile);
authRouter.delete('/deleteProfile', userMiddlewere, deleteProfile);
authRouter.get('/check', userMiddlewere, checkProfile);
authRouter.get('/profile', userMiddlewere, getProfile);

authRouter.post('/admin/register', adminMiddlewere, adminRegister);

authRouter.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);

authRouter.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_auth_failed`,
    }),
    googleAuthSuccess,
);

authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);



module.exports = authRouter;