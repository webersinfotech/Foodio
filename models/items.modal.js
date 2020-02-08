const mongoose = require('mongoose');

const itemsSchema = new mongoose.Schema({
    sName: {
        type: String
    },
    sPrice: {
        type: String
    },
    eType: {
        type: String
    },
    iCategoryId: {
        type: mongoose.Types.ObjectId
    },
    dCreatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    strict: false
});

module.exports = mongoose.model('items', itemsSchema);