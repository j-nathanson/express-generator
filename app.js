const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const config = require('./config'); //for connecting to mongodb 

// import our routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const uploadRouter = require('./routes/uploadRouter');

// connect to mongodb server
const mongoose = require('mongoose');

const url = config.mongoUrl;
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

// redirect any traffic from insecure http server to https. Secure traffic only
// app.all captures every type of req
// * for the path, will catch all paths
app.all('*', (req, res, next) => {
  // if already sent via https
  if (req.secure) {
    return next();
  } else {
    // if it was sent via http
    // log where the new path will be
    console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
    // redirect response to be handled at the https path instead
    // 301 permanent redirect
    res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// connect to passport
app.use(passport.initialize());

// allow unauth users to access the root path indexRouter so they can create one
app.use('/', indexRouter);
app.use('/users', usersRouter);

// will connect to files in our public folder index.html first
app.use(express.static(path.join(__dirname, 'public')));

// connect routers to the server can only access if authenticated
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
app.use('/imageUpload', uploadRouter);

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
