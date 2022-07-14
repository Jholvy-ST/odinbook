var express = require('express');
var router = express.Router();
const fileUploader = require('../cloudinary.config');
const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');
const comment_controller = require('../controllers/commentController');
const user = require('../models/user');
const passport = require('../auth');

// route middleware to make sure
const isLoggedIn = (req, res, next) => {
 
	// if user is authenticated in the session, carry on
	/*if (req.user)
			return next();

	// if they aren't redirect them to the home page
	//res.redirect('/');

	// Get auth header value
  /*const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }*/
}

//Users requests
/* GET request users list. */
router.post('/users', passport.authenticate('jwt', { session: false }), user_controller.users_list);

/* POST change profile picture. */
router.post('/change-profile-picture', passport.authenticate('jwt', { session: false }), user_controller.change_profile_pic);

/* POST send friend request. */
router.post('/send-friend-request', passport.authenticate('jwt', { session: false }), user_controller.send_friend_request);

/* POST accept friend request. */
router.post('/friend-requests', passport.authenticate('jwt', { session: false }), user_controller.accept_request);

/* POST delete friend request. */
router.post('/delete-request', passport.authenticate('jwt', { session: false }), user_controller.delete_request);

/* POST delete friend. */
router.post('/delete-friend', passport.authenticate('jwt', { session: false }), user_controller.delete_friend);

/* POST like post. */
router.post('/like-post', passport.authenticate('jwt', { session: false }), user_controller.like_post);

/* POST user details. */
router.post('/my-profile', passport.authenticate('jwt', { session: false }), user_controller.user_detail);

/* POST get other user details. */
router.post('/users/:id', passport.authenticate('jwt', { session: false }), user_controller.other_user_detail);

//Posts requests
/*POST create post. */
router.post('/create-post', passport.authenticate('jwt', { session: false }), post_controller.create_post);

/*POST delete post. */
router.post('/delete-post', passport.authenticate('jwt', { session: false }), post_controller.delete_post);

/* GET user and friends posts list. */
router.post('/user-posts', passport.authenticate('jwt', { session: false }), post_controller.post_list);

/* GET posts detail. */
router.get('/posts/:id', passport.authenticate('jwt', { session: false }), post_controller.post_detail);

/*POST edit a post. */
router.post('/edit-post', passport.authenticate('jwt', { session: false }), user_controller.edit_post);

//Comments requests
/*POST comment post. */
router.post('/comment-post', passport.authenticate('jwt', { session: false }), comment_controller.comment_post);

//Upload images
router.post('/cloudinary-upload', passport.authenticate('jwt', { session: false }), fileUploader.single('file'), (req, res, next) => {
  if (!req.file) {
    next(new Error('No file uploaded!'));
    res.send({message: 'Error'})
  }
 
  res.send({ secure_url: req.file.path });
});

module.exports = router;