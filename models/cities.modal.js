const mongoose = require('mongoose');

const citiesSchema = new mongoose.Schema({
    sName: {
        type: String
    },
    sLink: {
        type: String
    },
    dCreatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('cities', citiesSchema);