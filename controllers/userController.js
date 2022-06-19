const User = require('../models/user');
const Post = require('../models/post');
const async = require('async');
const { body,validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

exports.sign_user_post =  [
	// Validate and sanitize fields.
  body('first_name', 'First name name required').trim().isLength({ min: 1 }).escape(),
	body('last_name', 'Last name required').trim().isLength({ min: 1 }).escape(),
	body('username', 'Username name required').trim().isLength({ min: 1 }).escape(),
	body('password', 'Password required').trim().isLength({ min: 1 }).escape(),

	(req, res, next) => {
		const user = new User({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			username: req.body.username,
			password: req.body.password
		});
	
		bcrypt.hash(user.password, 10, (err, hashedPassword) => {
			user.password = hashedPassword;
			// if err, do something
			if (err) { 
				return next(err);
			}
			
			// otherwise, store hashedPassword in DB
			user.save(err => {
				if (err) { 
					return next(err);
				}
				res.redirect("/");
			});
		});
	}
];

exports.users_list = [
	(req, res, next) => {
		User.find()
		.exec( (err, user_list) => {
			if (err) { return next(err); }
			//Successful
			res.send({ user_list: user_list });
		})
	}
]

exports.user_detail = [
	/*(req, res, next) => {
		User.findById(req.user.id)
		.exec((err, found_user) => {
			if (err) { return next(err); }
			//Successful, so render
			res.send({ user: found_user });
		})
	}*/
	(req, res, next) => {
		async.parallel({
			user: (callback) => {
				User.findById(req.body.id)
				.populate('friends')
				.exec(callback)
			},
			posts: (callback) => {
				Post.find({ 'author': req.body.id })
				.populate('author')
				.exec(callback)
			}
		}, (err, results) => {
			if (err) { return next(err); }
			res.send( { user: results.user, posts: results.posts } )
		})
	}
]

exports.other_user_detail = [
	(req, res, next) => {
		User.findById(req.body.id)
		.exec((err, found_user) => {
			if (err) { return next(err); }
			//Successful, so render
			res.send({ user: found_user });
		})
	}
]

exports.send_friend_request = [
	(req, res, next) => {
		User.findById(req.body.req_id)
		.exec((err, found_user) => {
			if (err) { return next(err); }

			let user = new User(
				{
					_id: found_user.id,
					token: found_user.token,
					email: found_user.email,
					name: found_user.name,
					gender: found_user.gender,
					pic: found_user.pic,
					friends: found_user.friends,
					requests: found_user.requests
				}
			)

			if (user.requests.length > 0) {
				let found = false;
				for (let i = 0; i < user.requests.length; i++) {
					if (user.requests[i] == req.body.id) {
						found = true;
					}
				}

				if (!found) {
					user.requests.push(req.body.id)
				}
			} else {
				user.requests.push(req.body.id) 
			}
			
			

			User.findByIdAndUpdate(req.body.req_id, user, {}, function (err) {
				if (err) { return next(err); }
				// Successful - redirect to book detail page.
				res.send({message: 'Done'});
			});
		})
	}
]

exports.accept_request = [
	(req, res, next) => {
		User.findById(req.body.id)
		.exec((err, found_user) => {
			if (err) { return next(err); }

			let user = new User(
				{
					_id: found_user.id,
					token: found_user.token,
					email: found_user.email,
					name: found_user.name,
					gender: found_user.gender,
					pic: found_user.pic,
					friends: found_user.friends,
					requests: found_user.requests
				}
			)

			user.friends.push(req.body.req_id)

			const index = user.requests.indexOf(req.body.req_id);

			user.requests.splice(index, 1);

			User.findByIdAndUpdate(req.body.id, user, {}, function (err) {
				if (err) { return next(err); }
				// Successful - redirect to book detail page.
				next()
			});
		})
	},

	(req, res, next) => {
		User.findById(req.body.req_id)
		.exec((err, found_user) => {
			if (err) { return next(err); }

			let user = new User(
				{
					_id: found_user.id,
					token: found_user.token,
					email: found_user.email,
					name: found_user.name,
					gender: found_user.gender,
					pic: found_user.pic,
					friends: found_user.friends,
					requests: found_user.requests
				}
			)

			user.friends.push(req.body.id)

			User.findByIdAndUpdate(req.body.req_id, user, {}, function (err) {
				if (err) { return next(err); }
				// Successful
				res.send({ message: 'done'})
			});
		})
	}
] 

exports.delete_request = [
	(req, res, next) => {
		User.findById(req.body.id)
		.exec((err, found_user)=> {
			if (err) { return next(err); }

			const user = new User(
				{
					_id: found_user.id,
					token: found_user.token,
					email: found_user.email,
					name: found_user.name,
					gender: found_user.gender,
					pic: found_user.pic,
					friends: found_user.friends,
					requests: found_user.requests
				}
			)

			const index = user.requests.indexOf(req.body.req_id);

			user.requests.splice(index, 1);
			User.findByIdAndUpdate(req.body.id, user, {}, function (err) {
				if (err) { return next(err); }
				// Successful
				res.send({ message: 'done'})
			});
		})
	}
]

exports.like_post = [
	(req, res, next) => {
		Post.findById(req.body.post_id)
		.exec( (err, found_post) => {
			if (err) { return next(err); }

			let post = new Post(
				{
					content: found_post.content,
					author: found_post.author,
					date: found_post.date,
					likes: found_post.likes,
					_id: found_post.id
				}
			)

			if (post.likes.length > 0) {
				let found = false;
				for (let i = 0; i < post.likes.length; i++) {
					if (post.likes[i] == req.body.user_id) {
						found = true;
					}
				}

				if (!found) {
					post.likes.push(req.body.user_id)
				} else {
					const index = post.likes.indexOf(req.body.user_id);

					post.likes.splice(index, 1);
				}
			} else {
				post.likes.push(req.body.user_id) 
			}

			Post.findByIdAndUpdate(req.body.post_id, post, {}, function (err) {
				if (err) { return next(err); }
				res.send({likes: post.likes})
			});

		})
	}
]

exports.comment_post = [
	// Validate and sanitize fields.
  body('content', 'Content required').trim().isLength({ min: 1 }).escape(),

	(req, res, next) => {
		Post.findById(req.body.id)
		.exec( (err, found_post) => {
			if (err) { return next(err); }

			let post = new Post(
				{
					content: req.body.content,
					author: found_post.author,
					date: found_post.date,
					likes: found_post.likes,
					_id: found_post.id
				}
			)

			Post.findByIdAndUpdate(req.body.id, post, {}, function (err) {
				if (err) { return next(err); }
				res.send({post: found_post})
			});

		})
	}
]