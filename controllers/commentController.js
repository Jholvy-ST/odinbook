const Comment = require('../models/comment');
const Post = require('../models/post');
const { body,validationResult } = require('express-validator');

exports.comment_post = [
	(req, res, next) => {
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

			comment.save( (err) => {
				if (err) { return next(err); }

				res.send({comment: comment});
			})
		})
	}
]