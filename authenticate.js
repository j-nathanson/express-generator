const passport = require('passport'); // Obj to auth password
const LocalStrategy = require('passport-local').Strategy; // store info on the Nucampsite server
const User = require('./models/user'); // already has passport plugin
const JwtStrategy = require('passport-jwt').Strategy; //JSON Web Token strategy
const ExtractJwt = require('passport-jwt').ExtractJwt; //Object with helper methods
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const FacebookTokenStrategy = require('passport-facebook-token'); //facebook

const config = require('./config.js');


// configure the local storage
// export property 'local'
//config passport obj with a local strategy using the passport-local-mongoose method added to the User model
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Passport uses serializeUser function to persist user data (after successful authentication) into session. Function deserializeUser is used to retrieve user data from session.

// getToken method 
exports.getToken = function (user) {
    // user contains id for user doc
    //returns a token from sign method
    // sign in using the user, key string, expires in 1 hour
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

// configure JSON web token strategy for passport. opts options.
// set objects
// how the jwt should be extracted from the incoming req message/ could be sent in req.body req.header or url
// send in authorization header as a bearer token
// secret or key, configure strategy to use this string in this property as the token
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// export jwt passport
exports.jwtPassport = passport.use(
    // use jwt way to authenticate. config params, callback with payload from checking the token and 'done' callback function provide by passport-jwt to access the 'user' document so it can load info from in onto the req object
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            // jwt_payload object
            console.log('JWT payload:', jwt_payload);
            // search the data bases with the id from the token
            User.findOne({ _id: jwt_payload._id }, (err, user) => {
                if (err) {
                    // handle error
                    return done(err, false);
                } else if (user) {
                    // check if a user was found, if so return the object inside a callback function
                    return done(null, user);
                } else {
                    // no user was found return false inside of callback
                    // could prompt user here to make account
                    return done(null, false);
                }
            });
        }
    )
);

// export verify incoming request is from an authenticated user, don't create a session
exports.verifyUser = passport.authenticate('jwt', { session: false });

// Verify admin
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next() // user is an admin allow for next steps in router
    } else {
        // user is not an admin
        const err = new Error("You are not authorized to perform this operation!")
        err.status = 403
        // res.statusCode = 403
        // res.end("test")
        return next(err)
    }
}

// use a facebook login strategy
exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        // backend account info
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        },
        (accessToken, refreshToken, profile, done) => {
            // find a user from users collection with profile id
            User.findOne({ facebookId: profile.id }, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                if (!err && user) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    )
);