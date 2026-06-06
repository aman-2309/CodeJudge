const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const main = require('./config/db');
const cookie_parser = require('cookie-parser')
const passport = require('./config/passport');
const authRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemSet')
const submitRouter = require('./routes/submit')
const aiRouter = require('./routes/aiChatting')
const redisClient = require('./config/redis');
const videoRouter = require('./routes/videoCreator');
const cors = require('cors')


const allowedOrigins = ['http://localhost:5173', process.env.CLIENT_URL];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}))



app.use(express.json());
app.use(cookie_parser());
app.use(passport.initialize());

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);


const initializeConnection = async () => {
    try {
        await main(); // Upstash Redis does not require .connect()
        console.log("DB Connect");
        // Only start listening if not running on Vercel
        if (process.env.NODE_ENV !== 'production') {
            app.listen(process.env.PORT || 5000, () => {
                console.log("server listening at port no. " + (process.env.PORT || 5000));
            });
        }
    } catch (err) {
        console.error('Error: ' + err);
    }
}

initializeConnection();

// Export the app for Vercel serverless deployment
module.exports = app;
