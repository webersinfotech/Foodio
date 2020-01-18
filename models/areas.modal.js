const mongoose = require('mongoose');

const areasSchema = new mongoose.Schema({
    sName: {
        type: String
    },
    sLink: {
        type: String
    },
    iCityId: {
        type: mongoose.Types.ObjectId
    },
    bIsFetched: {
        type: Boolean,
        default: false
    },
    dCreatedAt: {
        type: Date,
        default: Date.now
    }
}, { strict: false });

module.exports = mongoose.model('areas', areasSchema);