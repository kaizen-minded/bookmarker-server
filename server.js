require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const passport = require('passport');

const authRoutes = require('./auth/router');
const { localStrategy } = require('./auth/strategies');

const challengesRoutes = require('./routes/challengesRouter');
const userRoutes = require('./routes/userRouter');

const { User } = require("./models/user");
const { DATABASE_URL, PORT } = require('./config');


const app = express();
const jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(jsonParser);
app.use(express.static("public"));

passport.use(localStrategy);
passport.serializeUser(function (user, cb) {
    cb(null, user._id);
});

passport.deserializeUser(function (id, cb) {
    User.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});
const localAuth = passport.authenticate('local', { session: true });

app.use(passport.initialize());
app.use(passport.session());
app.use('/', userRoutes);
app.use('/challenges', challengesRoutes);
app.use('/auth', authRoutes);
app.use(function (err, req, res, next) {
    console.log(err);
})

app.use(function (req,res,next) {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
      return res.send(204);
    }
    next();
  });

  app.use('*',(req,res) => {
    return res.status(404).json({ message: 'Not Found.' });
  });

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, { useNewUrlParser: true }, err => {
            if (err) {
                return reject(err);
            }
            server = app
                .listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };