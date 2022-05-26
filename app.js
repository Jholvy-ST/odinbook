var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
const passport = require("passport");
const facebookStrategy = require('passport-facebook').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const dev_db_url  = process.env.DBURL;
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const homeRouter = require('./routes/home')

var app = express();

app.use(cors())

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));

/*passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      /*if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" });
      }
			bcrypt.compare(password, user.password, (err, res) => {
				if (res) {
					// passwords match! log user in
					return done(null, user)
				} else {
					// passwords do not match!
					return done(null, false, { message: "Incorrect password" })
				}
			})
      //return done(null, user);
    });
  })
);*/

/*passport.use(new facebookStrategy({

	clientID        : process.env.APP_ID,
	clientSecret    : process.env.APP_SECRET,
	callbackURL     : "/auth/facebook/callback",
	profileFields: ['id', 'name', 'gender', 'picture.type(large)','email'],
	passReqToCallback: true

},// facebook will send back the token and profile
function(token, refreshToken, profile, cb) {

	// asynchronous
	process.nextTick(function() {

			// find the user in the database based on their facebook id
			User.findOne({facebookId: profile.id}, function(err, user) {

					// if there is an error, stop everything and return that
					// ie an error connecting to the database
					if (err)
							return done(err);

					// if the user is found, then log them in
					if (user) {
							console.log("user found")
							console.log(user)
							return cb(null, user); // user found, return that user
					} else {
							// if there is no user found with that facebook id, create them
							let newUser = new User();

							// set all of the facebook information in our user model
							newUser.facebookId = profile.id; // set the users facebook id                  
							newUser.token = token; // we will save the token that facebook provides to the user                    
							newUser.name = profile.name; // look at the passport user profile to see how names are returned
							newUser.email = profile.email // facebook can return multiple emails so we'll take the first
							newUser.gender = profile.gender
							newUser.pic = profile.photos[0].value
							// save our user to the database
							newUser.save(function(err) {
									if (err) {
										throw err;
									}
										
									// if successful, return the new user
									return cb(null, newUser);
							});
					}

			});

	})

}
));*/

passport.use(new FacebookTokenStrategy({
	clientID: process.env.APP_ID,
	clientSecret: process.env.APP_SECRET
}, (accessToken, refreshToken, profile, cb) => {
	/*const user  = User.findOne({'facebookId': profile.id});

	if (user) {
		return cb(null, user);
	}

		const newUser = new User(
			{
				facebookId: profile.id,
				name: profile.name,
				email: profile.emails.length ? profile.emails[0].value : null,
				gender: profile.gender,
				pic: profile.photos[0].value
			}
		)

		newUser.save( (err) => {
			if (err) {
				throw err;
			}
			
		// if successful, return the new user
		return cb(null, newUser);
	});*/
		//cb(null, newUser)
	
	User.find({'facebookId': profile.id}, function (error, user) {
		if (error) {return cb(error)}

		if (user) {
			console.log("user found")
			console.log(user)
			return cb(null, user); // user found, return that user
		} else {
				// if there is no user found with that facebook id, create them
				/*let newUser = new User();

				// set all of the facebook information in our user model
				newUser.facebookId = profile.id; // set the users facebook id                  
				newUser.token = accessToken; // we will save the token that facebook provides to the user                    
				newUser.name = profile.name; // look at the passport user profile to see how names are returned
				newUser.email = profile.email // facebook can return multiple emails so we'll take the first
				newUser.gender = profile.gender
				newUser.pic = profile.photos[0].value*/

				const newUser = new User(
					{
						facebookId: profile.id,
						name: profile.name,
						email: profile.emails.length ? profile.emails[0].value : null,
						gender: profile.gender,
						pic: profile.photos[0].value
					}
				)
				// save our user to the database
				newUser.save(function(err) {
						if (err) {
							return err;
						}
							
						// if successful, return the new user
						return cb(null, newUser);
				});
		}
	});
}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

app.use(compression()); //Compress all routes
app.use(helmet());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//app.use('/users', usersRouter);
app.use('/home', homeRouter);

//app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
app.get('/auth/facebook', passport.authenticate('facebook'));

/*app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : 'http://localhost:3000/',
            failureRedirect : 'http://localhost:3000/sign-in'
        }));*/

app.get('/auth/facebook/callback',
passport.authenticate('facebook', { failureRedirect: 'http://localhost:3000/sign-in' }),
function(req, res) {
	// Successful authentication, redirect home.
	res.redirect('http://localhost:3000/');
});

/*app.get('/auth/facebook/token',
  passport.authenticate('facebook-token'),
  function (req, res) {
    // do something with req.user
    res.send(req.user? 200 : 401);
  }
);*/

app.get('/auth/facebook/token', passport.authenticate('facebook-token', { session: false }), (req, res) => {
	res.send({user: req.user});
	//res.send({message: 'Done'})
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.get("/log-out", (req, res) => {
  req.logout();
  //res.redirect("/");
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
	res.send({error: err});
});

module.exports = app;
