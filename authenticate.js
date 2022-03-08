const passport = require('passport'); // Obj to auth password
const LocalStrategy = require('passport-local').Strategy; // store info on the Nucampsite server
const User = require('./models/user'); // already has passport plugin

// configure the local storage
// export property 'local'
//config passport obj with a local strategy using the passport-local-mongoose method added to the User model
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Passport uses serializeUser function to persist user data (after successful authentication) into session. Function deserializeUser is used to retrieve user data from session.