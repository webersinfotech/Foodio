const mongoose = require('mongoose');

const cloudinarySchema = new mongoose.Schema({
    email: {
        type: String
    },
    password: {
        type: String
    },
    inUse: {
        type: Boolean,
        default: false
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    storageUsage: {
        type: Number
    },
    creditUsage: {
        type: Number
    },
    apiKey: {
        type: String
    },
    apiSecret: {
        type: String
    },
    cloudName: {
        type: String
    }
});

module.exports = mongoose.model('cloudinarys', cloudinarySchema);