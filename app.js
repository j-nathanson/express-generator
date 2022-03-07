const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
// require('session-file-store') will return a function that uses session as param
const FileStore = require('session-file-store')(session);

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
//app.use(cookieParser('12345-67890-09876-54321')); 

// use session/filstore middlewar
// signed string
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


// Authentication
function auth(req, res, next) {
  // added session property
  console.log(req.session);

  if (!req.session.user) {
    // check if they signed in
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // if they haven't prompt them
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    // check username/password submission
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    // set up/signs a cookie for the user for future sign ins
    if (user === 'admin' && pass === 'password') {
      req.session.user = 'admin';
      return next(); // authorized
    } else {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  } else {
    // User DOES have a cookie
    if (req.session.user === 'admin') {
      return next();
    } else {
      const err = new Error('You are not authenticated!');
      err.status = 401;
      return next(err);
    }
  }
}

// add middleware to server
app.use(auth);

// will connect to files in our public folder index.html first
app.use(express.static(path.join(__dirname, 'public')));

// connect routers to the server
app.use('/', indexRouter); // will connect to route/index which is connected to jade index file
app.use('/users', usersRouter);
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
