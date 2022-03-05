const mongoose = require('mongoose');
// shorthand to the mongoose scheme function
const Schema = mongoose.Schema;

// import schema that is specially for money data so we can set a property type
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const promotionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;