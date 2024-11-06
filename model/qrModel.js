const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },// take a user id from Local Storag
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);
