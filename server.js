require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const passport = require('passport');

const userRoutes = require('./routes/userRouter');
const authRoutes = require('./auth/router');
const { localStrategy, JwtStrategy } = require('./auth/strategies');
const bookRoutes = require('./routes/bookRouter');

const { User } = require("./models/user");

const { DATABASE_URL, PORT } = require('./config');

mongoose.Promise = global.Promise;

const app = express();
const jsonParser = bodyParser.json();

app.use(passport.initialize());
app.use(require('morgan')('combined'));
app.use(jsonParser);

app.use(function (req,res,next) {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
      return res.send(204);
    }
    next();
  });

passport.use(localStrategy);
passport.use(JwtStrategy);


const jwtAuth = passport.authenticate('jwt', { session: false })

app.use('/', userRoutes);
app.use('/auth', authRoutes);
app.use('/book', jwtAuth,  bookRoutes);




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