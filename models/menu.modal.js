const mongoose = require('mongoose');

const menusSchema = new mongoose.Schema({
    res_id: {
        type: mongoose.Types.ObjectId
    },
    res_id: {
        type: mongoose.Types.ObjectId
    },
    dCreatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('menus', menusSchema)