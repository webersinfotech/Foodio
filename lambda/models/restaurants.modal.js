const mongoose = require('mongoose');

const restaurantsSchema = new mongoose.Schema({
    sName: {
        type: String
    },
    sLink: {
        type: String
    },
    iAreaId: {
        type: mongoose.Types.ObjectId
    },
    dCreatedAt: {
        type: Date,
        default: Date.now
    }
}, { strict: false });

module.exports = mongoose.model('restaurants', restaurantsSchema)