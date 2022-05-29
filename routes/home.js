var express = require('express');
var router = express.Router();
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
router.get('/users', isLoggedIn, user_controller.users_list);

/* POST send friend request. */
router.post('/users', isLoggedIn, user_controller.send_friend_request);

/* POST accept friend request. */
router.post('/friend-requests', isLoggedIn, user_controller.accept_request);

/* POST like post. */
router.post('/like-post', isLoggedIn, user_controller.like_post);

/* POST user details. */
router.post('/my-profile', isLoggedIn, user_controller.user_detail);

/* POST get other user details. */
router.post('/users/:id', isLoggedIn, user_controller.other_user_detail);

//Posts requests
/*POST create post. */
router.post('/create-post', isLoggedIn, post_controller.create_post);

/* GET user and friends posts list. */
router.get('/user-posts', passport.authenticate('jwt', { session: false }), post_controller.post_list);

/* GET posts detail. */
router.get('/posts/:id', isLoggedIn, post_controller.post_detail);

//Comments requests
/*POST comment post. */
router.post('/comment-post', isLoggedIn, comment_controller.comment_post);

module.exports = router;