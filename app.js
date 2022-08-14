var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
//const passport = require("passport");
const facebookStrategy = require('passport-facebook').Strategy;
//const FacebookTokenStrategy = require('passport-facebook-token');
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const passport = require('./auth');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const dev_db_url  = process.env.DBURL;
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const indexRouter = require('./routes/index');
const homeRouter = require('./routes/home')

const app = express();

const corsOptions = {
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(session({ secret: process.env.TOKEN_KEY, resave: false, saveUninitialized: true }));

app.use(compression()); //Compress all routes
app.use(helmet());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/home', homeRouter);

app.get('/auth/facebook/token', passport.authenticate('facebook-token', { session: false }), (req, res) => {
	return res.json(req.user);
});

app.post('/auth/local', passport.authenticate('local', { session: false }), (req, res) => {
	return res.json(req.user);
});

app.get('/test', (req, res) => {
	return res.json({data: 'Response'});
});

app.get("/log-out", (req, res) => {
  req.logout();
  res.redirect("/");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
	res.send({error: err});
});

module.exports = app;
