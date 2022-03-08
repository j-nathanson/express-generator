const express = require('express');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// POST allows new user to register on website
router.post('/signup', (req, res) => {
  User.register(
    //create new User obj with its username,password from the client
    //provide err callback
    new User({ username: req.body.username }),
    req.body.password,
    err => {
      // if err, could be internal error from the server send back err object
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      } else {
        // no error, tell passport to use the local strategy and after send back successful message
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Registration Successful!' });
        });
      }
    }
  );

});

// check if user is already logged in
// use middleware before sending back response
// passport already takes care of the errors
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are successfully logged in!' });
});

// logging out and stop tracking session
router.get('/logout', (req, res, next) => {
  // check if session exist
  if (req.session) {
    // delete the session on the server side, session id wont work
    req.session.destroy();
    // clear the cookie on the client
    res.clearCookie('session-id');
    //redirect to root path
    res.redirect('/');
  } else {
    // client is already logged out and is trying to log out
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
});

module.exports = router;