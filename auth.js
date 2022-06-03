const passport = require('passport');
const jwt = require('jsonwebtoken');
const FacebookTokenStrategy = require('passport-facebook-token');
const PassportJWT = require('passport-jwt');
const JWTStrategy = PassportJWT.Strategy;
const ExtractJwt = PassportJWT.ExtractJwt;
const User = require('./models/user');

require('dotenv').config();

passport.use(new FacebookTokenStrategy({
	clientID: process.env.APP_ID,
	clientSecret: process.env.APP_SECRET
}, (accessToken, refreshToken, profile, cb) => {
	
	User.findOne({'facebookId': profile.id}, function (error, user) {
		if (error) {return cb(error)}

		if (user !== null) {
			console.log("user found")
			console.log(user)
			const token = jwt.sign({user}, process.env.TOKEN_KEY, { expiresIn: '1h' });
			//return cb(null, user); // user found, return that user
			return cb(null, Object.assign({}, user, { token }));
		} else {

				const newUser = new User(
					{
						facebookId: profile.id,
						name: profile.name.givenName + ' ' + profile.name.familyName,
						email: profile.emails.length ? profile.emails[0].value : null,
						gender: profile.gender,
						pic: profile.photos[0].value
					}
				)
				// save our user to the database
				newUser.save(function(err) {
						if (err) {
							return cb(null, {message: err});
						}
							
						const token = jwt.sign({newUser}, process.env.TOKEN_KEY, { expiresIn: '1h' });
						// if successful, return the new user
						//return cb(null, newUser);
						return cb(null, Object.assign({}, newUser, { token }));
				});
		}
	});
}
));

passport.use(new JWTStrategy({
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.TOKEN_KEY
}, (jwtPayload, cb) => {
	try {
		const user = User.findById(jwtPayload.id);
		if (!user) {
				return cb(null, false);
		}
		return cb(null, user);
	} catch (error) {
			return (error, false);
	}

	/*User.findById(jwtPayload.id, (err, user) => {

		if (err) {return cb(err)}
		return cb(null, user);
	});*/

	
}));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});

module.exports = passport;