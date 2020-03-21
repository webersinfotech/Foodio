const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    sName: {
        type: String
    },
    sMobile: {
        type: String
    },
    sUID: {
        type: String
    },
}, { strict: false });

module.exports = mongoose.model('users', usersSchema)