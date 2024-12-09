const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderType',
        required: true
    },
    senderType: {
        type: String,
        required: true,
        enum: ['AdminUser', 'Employee', 'Client']
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'receiverType',
        required: true
    },
    receiverType: {
        type: String,
        required: true,
        enum: ['AdminUser', 'Employee', 'Client']
    },
    message: {
        type: String,
    },
    imageUrls: [{
        type: String
    }],
    audioUrl: {
        type: String
    },
    recordingUrl: {
        type: String
    },
    videoUrl: {
        type: String
    },
    emoji: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Chats', chatSchema);