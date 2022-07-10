const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const async = require('async');
const { body,validationResult } = require('express-validator');

exports.create_post = [
	// Validate and sanitize fields.
  body('content', 'Content required').trim().isLength({ min: 1 }).escape(),
	body('author', 'Author required').trim().isLength({ min: 1 }).escape(),


	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		const post = new Post(
			{
				content: req.body.content,
				author: req.body.author,
			}
		)

		if (req.body.image) {
			post.image = req.body.image
		}
		
		post['likes'] = [];
		post['date'] = Date.now();

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/errors messages.
			res.json({ post: post, errors: errors.array() });
		} else {
			post.save(function (err) {
				if (err) { return next(err); }
				// Successful - redirect to new author record.
				res.send({post: post});
			});
		}
		
	}
]

exports.post_detail = [
	(req, res, next) => {
		async.parallel({
			post: (callback) => {
				Post.findById(req.params.id)
				.exec(callback)
			},
			comments: (callback) => {
				Comment.find({ 'post': req.params.id })
				.populate("author")
				.exec(callback)
			}
		}, (err, results) => {
			if (err) { return next(err); }

			res.send( { post: results.post, comments: results.comments } )
		})
	}
]

exports.post_list = [
	(req, res, next) => {
		async.parallel({
			own_posts: (callback) => {
				Post.find({ 'author': req.body.id })
				.populate('author')
				.exec(callback)
			},
			friends: (callback) => {
				User.find({ 'friends': req.body.id })
				.exec(callback)
			}
		}, (err, results) => {
			if (err) { return next(err); }

			res.send( { own_posts: results.own_posts, friends: results.friends } )
		})
	}
]

exports.delete_post = [
	(req, res, next) => {
		Post.findById(req.body.id)
		.exec((err, found_post)=> {
			if (err) { return next(err); }

			Post.findByIdAndRemove(found_post.id, function deletePost(err) {
				if (err) { return next(err); }
				// Success - go to author list
				res.send({message: 'Done'})
			})
		})
	}
]