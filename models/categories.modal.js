const mongoose = require('mongoose');

const categoriesSchema = new mongoose.Schema({
    sName: {
        type: String
    },
    dCreatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    strict: false
});

module.exports = mongoose.model('categories', categoriesSchema);