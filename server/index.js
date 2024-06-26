require('dotenv').config({ path: '.env' });

//Library imports
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const crypto = require("crypto");
const MongoStore = require("connect-mongo");
const cookieParser = require('cookie-parser');

//middleware imports
const { ErrorHandler } = require('./middleware/ErrorHandler');
require("./database/db");
require("./middleware/localStrategy");

//Route imports
const local = require('./routes/manualLogin');
const facebookRoute = require('./routes/facebookRoute');
const githubRoute = require('./routes/githubRoute');
const googleRoute = require('./routes/googleRoute');
const discordRoute = require("./routes/discordRoute");

//init server
const app = express();
const port = process.env.PORT || 4000;
const sessionSecret = crypto.randomBytes(32).toString("hex");
const cookieSecret = crypto.randomBytes(16).toString("hex");

app.use(cors({credentials: true, origin: process.env.CLIENT_ORIGIN}));
app.use(express.json());
app.use(cookieParser(cookieSecret))

const mongooseUri = process.env.MONGOOSE_URI;

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongooseUri }),
    cookie: {
        maxAge: 120000,
        httpOnly: true,
        secure: false
    }
}));


app.use(passport.session());
app.use(passport.initialize());

const User = require('./models/User');
require('./models/SocialUser')

//middleware
app.use(ErrorHandler)

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', local);
app.use('/', googleRoute);
app.use('/', facebookRoute);
app.use('/', githubRoute);
app.use("/", discordRoute)

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

let _ = {};

_.start = () => {
    try {
        app.listen(port)
        console.log(`Express server listening on port ${port}`)
    } catch (err) {
        throw new Error(err)
    }
};

_.start();



