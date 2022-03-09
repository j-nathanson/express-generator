const mongoose = require('mongoose');
// shorthand to the mongoose scheme function
const Schema = mongoose.Schema;

// import schema that is specially for money data so we can set a property type
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;


// schema represents the structure of a particular document, either completely or just a portion of the document

// new schema for documents storing comments data for a specific campsite. doc within a doc. objects within an object
const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});



// creating a stucture for the 'campsite' document
// each doc required to have 5 properties (plus optional one and 2 timestamps), no 2 docs can have the same name. campsites can have comments property to store the comments in an array. Comments added must follow this stucture
const campsiteSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema]
}, {
    timestamps: true
});

// conects schema to collection in the data base
// first argument name of the collection
// will look for the lower case plural version of this name
// second arg the schema for how the data will look like
const Campsite = mongoose.model('Campsite', campsiteSchema);

// export
module.exports = Campsite;