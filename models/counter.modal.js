const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    counter: {
        type: Number
    }
});

module.exports = mongoose.model('counters', counterSchema);