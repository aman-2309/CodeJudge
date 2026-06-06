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


app.use(cors({
    origin: 'http://localhost:5173',
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
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB Connect");
        app.listen(process.env.PORT, () => {
            console.log("server listening at port no. " + process.env.PORT);
        })
    } catch (err) {
        console.error('Error: ' + err);
    }
}

initializeConnection();


