const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*const UserSchema = new Schema(
	{
		first_name: {type: String, required: true, maxLength: 50},
		last_name: {type: String, required: true, maxLength: 50},
		username: {type: String, required: true, maxLength: 50},
		password: {type: String, required: true, maxLength: 150},
	}
);*/

const UserSchema = mongoose.Schema({
	facebookId: {type: String},
	token: {type: String},
	email: {type: String},
	name: {type: String},
	gender: {type: String},
	pic: {type: String},
	requests: {type: Array},
	friends: {type: Array}
});

UserSchema
.virtual('url')
.get( function() {
	return '/index/users/' + this._id;
})

module.exports = mongoose.model('User', UserSchema);