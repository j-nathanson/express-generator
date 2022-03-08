const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
// require('session-file-store') will return a function that uses session as param
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const authenticate = require('./authenticate');

// import our routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

// connect to mongodb server
const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//from response log a message
// then methods can have err as second arg
connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err)
);

//--end of section 

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// use session/filestore middleware
//like a cookie but can track data
// if nothing happens in a session the session wont be saved
// resave keep session active
// fileStore to run on hard disk
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

// only if you are using session authentication
// middle ware functions that check for existing session for a client
// if so the session data loaded into 'req.user'
app.use(passport.initialize());
app.use(passport.session());


// allow unauth users to access the root path indexRouter so they can create one
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Authentication
function auth(req, res, next) {
  // log session data
  console.log(req.user);

  // if there is no session data throw err, user not signed in
  if (!req.user) {
    const err = new Error('You are not authenticated!');
    err.status = 401;
    return next(err);
  } else {
    // pass client to next middleware
    return next();
  }
}

// add middleware to server
app.use(auth);

// will connect to files in our public folder index.html first
app.use(express.static(path.join(__dirname, 'public')));

// connect routers to the server can only access if authenticated
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
