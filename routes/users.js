const express = require('express');
const User = require('../models/user');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// POST allows new user to register on website
router.post('/signup', (req, res, next) => {

  // check db if username isn't already taken
  User.findOne({ username: req.body.username })
    .then(user => {
      if (user) {
        // if db returns the user, then username has already been taken
        const err = new Error(`User ${req.body.username} already exists!`);
        err.status = 403;
        return next(err);
      } else {
        // not found in the db so we can create an account with the req username
        User.create({
          username: req.body.username,
          password: req.body.password
        })
          // send user back to the client
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ status: 'Registration Successful!', user: user });
          })
          // error catch for dealing with aysync func on the user
          .catch(err => next(err));
      }
    })
    // error catch for findOne
    .catch(err => next(err));
});

// check if user is already logged in
router.post('/login', (req, res, next) => {
  if (!req.session.user) {
    // there is no session id cookie 

    // check the auth in headers to see if they are signed in
    const authHeader = req.headers.authorization;

    // prompt to sign in
    if (!authHeader) {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    // decode username and password
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    // search db for the username
    User.findOne({ username: username })
      .then(user => {
        if (!user) {
          // user was not found in the db
          const err = new Error(`User ${username} does not exist!`);
          err.status = 401;
          return next(err);
        } else if (user.password !== password) {
          // password entered was incorrect
          const err = new Error('Your password is incorrect!');
          err.status = 401;
          return next(err);
        } else if (user.username === username && user.password === password) {
          // user was found and username/password entered is correct, extra assurance by rechecking the username
          req.session.user = 'authenticated';
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('You are authenticated!')
        }
      })
      .catch(err => next(err));
  } else {
    // there is a session being tracked already, already logged in
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
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