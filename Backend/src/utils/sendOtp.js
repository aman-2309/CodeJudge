const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password, not your real password
    },
});

const sendOtpEmail = async (toEmail, otp) => {
    await transporter.sendMail({
        from: `"MyApp" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your OTP for Registration",
        html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Valid for 10 minutes.</p>`,
    });
};

module.exports = sendOtpEmail;