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
    isEdited: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    clearedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        userType: {
            type: String,
            required: true,
            enum: ['AdminUser', 'Employee', 'Client']
        },
        clearedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const userChatSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    otherUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['AdminUser', 'Employee', 'Client']
    },
    backgroundColor: {
        type: String,
        default: '#efeae2'
    },
    backgroundImage: {
        type: String
    }
});

const UserChatSettings = mongoose.model('UserChatSettings', userChatSettingsSchema);

module.exports = { 
    Chat: mongoose.model('Chats', chatSchema),
    UserChatSettings
};