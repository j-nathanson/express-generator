const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
});

// will automatically add username and password/ will salt and hash password
// will also add authentication methods on the model
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);