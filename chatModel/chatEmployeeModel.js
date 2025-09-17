const mongoose = require('mongoose');

const employeeChatSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    message: {
        type: String,
        required: function() {
            // Message is required only if no files are present
            return !this.imageUrls?.length && !this.videoUrl && !this.audioUrl && !this.recordingUrl;
        }
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
            ref: 'Employee',
            required: true
        },
        clearedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isSystemMessage: {
        type: Boolean,
        default: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
});

const employeeChatSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    otherUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    backgroundColor: {
        type: String,
        default: '#efeae2'
    },
    backgroundImage: {
        type: String
    }
});

const EmployeeChatSettings = mongoose.model('EmployeeChatSettings', employeeChatSettingsSchema);

const employeeStatusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    socketId: {
        type: String
    }
});

const EmployeeStatus = mongoose.model('EmployeeStatus', employeeStatusSchema);

module.exports = {
    EmployeeChat: mongoose.model('EmployeeChats', employeeChatSchema),
    EmployeeChatSettings,
    EmployeeStatus
};
