const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user')
const { body,validationResult } = require('express-validator');

exports.comment_post = [
	// Validate and sanitize fields.
  body('content', 'Content required').trim().isLength({ min: 1 }).escape(),
	body('author', 'Author required').trim().isLength({ min: 1 }).escape(),

	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		Post.findById(req.body.post)
		.exec( (err, found_post) => {
			if (err) { return next(err); }

			const comment = new Comment(
				{
					content: req.body.content,
					author: req.body.author,
					post: req.body.post,
				}
			)

			comment['date'] = Date.now();

			if (!errors.isEmpty()) {
				// There are errors.
				res.json({ errors: errors.array() });
			} else {
				comment.save( (err) => {
					if (err) { return next(err); }
	
					User.findById(req.body.author)
					.exec((err, author)=> {
						if (err) { return next(err); }
						res.send({comment: comment, author: author});
					})
				})
			}
		})
	}
]

exports.edit_comment = [
	// Validate and sanitize fields.
  body('content', 'Content required').trim().isLength({ min: 1 }).escape(),

	(req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			// There are errors.
			res.json({ errors: errors.array() });
		} else {
			Comment.findById(req.body.id)
			.exec( (err, found_comment) => {
				if (err) { return next(err); }
	
				const comment = new Comment(
					{
						content: req.body.content,
						author: found_comment.author,
						post: found_comment.post,
						date: found_comment.date,
						likes: found_comment.likes,
						_id: found_comment.id
					}
				)
	
				Comment.findByIdAndUpdate(req.body.id, comment, {}, function (err) {
					if (err) { return next(err); }
					res.send({comment: comment})
				});
	
			})
		}
		
	}
]

exports.delete_comment = [
	(req, res, next) => {
		Comment.findById(req.body.id)
		.exec((err, found_comment)=> {
			if (err) { return next(err); }

			Comment.findByIdAndRemove(found_comment.id, function deleteComment(err) {
				if (err) { return next(err); }
				// Success - go to author list
				res.send({deleted: req.body.id})
			})
		})
	}
]