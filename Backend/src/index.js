
const express = require('express');
const app = express();
app.set('trust proxy', 1); // Trust Vercel's proxy to correctly identify https requests
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');
const cookie_parser = require('cookie-parser');
const passport = require('./config/passport');
const authRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemSet');
const submitRouter = require('./routes/submit');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator');
const cors = require('cors');

// ✅ CORS
const allowedOrigins = [
    'http://localhost:5173',
    process.env.CLIENT_URL,
    process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        // Allow configured origins, localhost, or any vercel.app deployment
        if (allowedOrigins.includes(origin) ||
            origin.startsWith('http://localhost:') ||
            origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.warn(`Blocked CORS request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.options(/.*/, cors()); // handle preflight

app.use(express.json());
app.use(cookie_parser());
app.use(passport.initialize());

// ✅ DB connection middleware — runs before every request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("DB connection error:", err);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// Routes
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);

// ✅ Local dev only
if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log("Server listening on port " + (process.env.PORT || 5000));
        });
    }).catch(console.error);
}

module.exports = app;