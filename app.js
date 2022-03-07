const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

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
app.use(cookieParser());

// users must authenticate before connecting to the server and access data
// on load of the homepage the middleware function will check from the user's req (GET) if they have any auth data, and if that data is present use  a basic check in order for access to the public folder files
function auth(req, res, next) {
  // log the req header, .authorization should be there if they have a password saved
  console.log(req.headers);
  const authHeader = req.headers.authorization;
  // if .authorization is empty use setHeader to make the user enter a password
  if (!authHeader) {
    const err = new Error('You are not authenticated!');
    // let client know you are requesting auth info with the 'Basic' method of input
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    // send error to client
    return next(err);
  }

  // user has auth info
  // encoded from client as 'Basic YWRtaW46cGFzc3dvcmQ='
  // change to admin:password
  // Buffer used to decode
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  // then to array ['admin':'password']
  const user = auth[0];
  const pass = auth[1];

  // basic authentication, if pass then move on to the next
  if (user === 'admin' && pass === 'password') {
    return next(); // authorized
    // challenge client for auth
  } else {
    const err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
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
