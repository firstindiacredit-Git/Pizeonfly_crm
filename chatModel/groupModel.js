const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        userType: {
            type: String,
            enum: ['AdminUser', 'Employee', 'Client']
        }
    }],
    lastMessage: {
        message: String,
        sender: {
            id: mongoose.Schema.Types.ObjectId,
            name: String,
            type: String
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Group', groupSchema);
